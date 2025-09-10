import { fetchChartData } from './bar_chart_script.js';

let urlSearchParams = new URL(window.location.href).searchParams;
let userPhoneNumber = urlSearchParams.get('phoneNumber');

document.addEventListener("DOMContentLoaded", async function () {
  await loadProfileDetail();
  await displayLocationOptions();
  await isUserStatusActive() ? addPageEventListeners() : showDeactivatedOverlay();
  await addDownloadReportListener();
  addLocationSelectionListener();
  addHrefNavigationPaths(userPhoneNumber);
});

async function addPageEventListeners() {
  await addRecommendCropListener();
  await addUpdateProfileListener();
  await addOpenDialogListener();
  await addCloseDialogListener();
}

async function addRecommendCropListener() {
  document.getElementById('locationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const downloadReportBtnElem = document.getElementById('downloadReportButton');
    const location = document.getElementById('location').value;

    if (!location) {
      alert('Please select a location.');
      return;
    }

    const spinnerOverlay = document.getElementById('spinner-overlay');
    spinnerOverlay.style.display = 'flex';

    try {
      const response = await fetch(`http://localhost:5000/recommendation/crop_recommendation?location=${location}`);
      const data = await response.json();

      spinnerOverlay.style.display = 'none';

      const weatherDiv = document.getElementById('weather');
      weatherDiv.innerHTML = `
          <p><strong>Time:</strong> ${data.weather.time}</p>
          <p><strong>Temperature:</strong> ${data.weather.temp}°C</p>
          <p><strong>Condition:</strong> ${data.weather.description}</p>
          <img src="https://openweathermap.org/img/wn/${data.weather.icon}@2x.png" alt="${data.weather.description}" />
        `;

      const soilDiv = document.getElementById('soil');
      soilDiv.innerHTML = `
          <p><strong>Type:</strong> ${data.soil.type}</p>
          <p><strong>pH Range:</strong> ${data.soil.ph_min} - ${data.soil.ph_max}</p>
          <p><strong>Moisture Content:</strong> ${data.soil.moisture_min}% - ${data.soil.moisture_max}%</p>
        `;

      const cropsList = document.getElementById('crops');
      cropsList.innerHTML = data.crops.map((crop, index) => `<div>${index + 1}. ${crop}</div>`).join('');

      fetchChartData(location);
      downloadReportBtnElem.disabled = false;
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    }
  });
}

async function addOpenDialogListener() {
  document.getElementById('open_dialog_button').addEventListener('click', async (event) => {
    event.preventDefault();
    const dialog = document.getElementById('profileDialog');
    dialog.showModal();
  });
}

async function addCloseDialogListener() {
  document.getElementById('close_dialog_button').addEventListener('click', async (event) => {
    event.preventDefault();
    const dialog = document.getElementById('profileDialog');
    dialog.close();
  });
}

async function addUpdateProfileListener() {
  document.getElementById('upload_profile_btn').addEventListener('click', async (event) => {
    event.preventDefault();
    let username = document.getElementById('newUsername').value;
    const profileImageInput = document.getElementById("newProfileImage").files[0];

    if (!username || !profileImageInput) {
      alert("Please enter a title and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("file", profileImageInput);

    let uploadType = "profile_image";

    try {
      const response = await fetch(`http://localhost:5000/uploads/file_upload?uploadType=${uploadType}&phoneNumber=${userPhoneNumber}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Image profile uploaded successfully`);
        loadProfileDetail();
      } else {
        console.log("Upload failed:");
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("statusMessage").textContent = "Upload failed. Please try again.";
    }

    const dialog = document.getElementById('profileDialog');
    dialog.close();
  });
}

async function loadProfileDetail() {
  if (userPhoneNumber === null) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/uploads/get_profile?phoneNumber=${userPhoneNumber}`);
    const profileDetail = await response.json();

    const profileImgElem = document.getElementById('profile-img');

    if (profileDetail.profile_image && profileDetail.profile_image !== '') {
      profileImgElem.src = `http://localhost:5000/backend${profileDetail.profile_image}`;
    } else {
      profileImgElem.src = `/media/profile_image_placeholder.png`;
    }

    const profileName = document.getElementById('profile_name');
    profileName.textContent = profileDetail.username;

  } catch (error) {
    console.error("Error fetching profileDetail:", error);
    document.getElementById("profileImageContainer").innerHTML = "<div>Error loading Profile details</div>";
  }
}

async function isUserStatusActive() {
  try {
    const response = await fetch(`http://localhost:5000/users/get_user_status?phoneNumber=${userPhoneNumber}`);
    const { status } = await response.json();
    if (response.ok) {
      console.log(`user status: ${status}`);
      return status === 'active';
    } else {
      console.log("Unable to get user status");
    }
  } catch (error) {
    console.error('Error checking user status:', error);
  }
}

function showDeactivatedOverlay() {
  const overlayElem = document.getElementById('overlay');
  const bodyElem = document.body;

  overlayElem.classList.remove('hidden');
  bodyElem.style.filter = 'grayscale(100%)';
  bodyElem.style.pointerEvents = 'none';
}

async function addHrefNavigationPaths(userPhoneNumberSearchParam) {
  const homeAnchors = document.querySelectorAll('.home-anchor-btn');
  homeAnchors.forEach((anchor, _) => {
    anchor.href = `/home?phoneNumber=${userPhoneNumberSearchParam}`;
  });

  const blogAnchors = document.querySelectorAll('.blog-anchor-btn');
  blogAnchors.forEach((anchor, _) => {
    anchor.href = `/blog?phoneNumber=${userPhoneNumberSearchParam}`;
  });

  const aboutAnchors = document.querySelectorAll('.about-anchor-btn');
  aboutAnchors.forEach((anchor, _) => {
    anchor.href = `/about?phoneNumber=${userPhoneNumberSearchParam}`;
  });

  const loginAnchors = document.querySelectorAll('.login-anchor-btn');
  loginAnchors.forEach((anchor, _) => {
    anchor.href = userPhoneNumberSearchParam ?? '/login';
  });

  const signupAnchors = document.querySelectorAll('.signup-anchor-btn');
  signupAnchors.forEach((anchor, _) => {
    anchor.href = userPhoneNumberSearchParam ?? "/signup";
  });

  const logOutAnchors = document.querySelectorAll('.logout-anchor-btn');
  logOutAnchors.forEach((anchor, _) => {
    anchor.href = `/home`;
  });
}

async function addDownloadReportListener() {
  document.getElementById('downloadReportButton').addEventListener('click', async (e) => {
    e.preventDefault();

    const location = document.getElementById('location').value;

    if (!location) {
      alert('Please select a location before downloading the PDF.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/reports/export_crop_recommendation_data?location=${location}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crop_recommendation.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('An error occurred while downloading the PDF.');
    }
  });
}

async function displayLocationOptions() {
  const selectElem = document.getElementById('location');

  try {
    const response = await fetch("http://localhost:5000/locations/get_locations");
    const locations = await response.json();
    locations.forEach((location, _) => {
      const option = document.createElement('option');
      option.value = location.location_name;
      option.text = location.location_name;
      selectElem.appendChild(option);
    });
  } catch (error) {
    console.error('Error', error);
    alert(error);
  }
}

function addLocationSelectionListener() {
  const selectElem = document.getElementById('location');
  selectElem.addEventListener('change', function (event) {
    const downloadReportBtnElem = document.getElementById('downloadReportButton');
    downloadReportBtnElem.disabled = true;
  });
}

