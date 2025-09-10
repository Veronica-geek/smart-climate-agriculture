let urlSearchParams = new URL(window.location.href).searchParams;
let userPhoneNumber = urlSearchParams.get('phoneNumber');

document.addEventListener("DOMContentLoaded", async function () {

    await displayLocationOptions();
    await addHrefNavigationPaths(userPhoneNumber);

    await fetchUsers();
    await loadProfileDetail();
    await addUpdateProfileListener();
    await addOpenDialogListener();
    await addCloseDialogListener();

    await addGenerateReportListener();
    await addDownloadReportListener();

    await addLocationSelectionListener();
    await addUpdateSoilDataListener();
});


async function fetchUsers() {
    try {
        const response = await fetch("http://localhost:5000/users/get_users");
        const users = await response.json();
        let userList = document.getElementById("userList");
        userList.innerHTML = ""; // Clear existing content

        users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = `${user.username} (${user.status}) `;


            if (user.status === "active" && user.role === "user") {
                li.appendChild(createButton("Deactivate", "action-btn deactivate-btn", () => deactivateUser(user.phone_number, "deactivated")));
            } else if (user.status === "deactivated") {
                li.appendChild(createButton("Activate", "action-btn activate-btn", () => activateUser(user.phone_number, "active")));
            }

            if (user.role === "user") {
                li.appendChild(createButton("Delete", "action-btn delete-btn", () => deleteUser(user.phone_number)));
            }


            userList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    button.onclick = onClick;
    return button;
}

async function deactivateUser(userPhoneNumber, newStatus) {
    updateUserStatusDb(userPhoneNumber, newStatus);
}

function activateUser(userPhoneNumber, newStatus) {
    updateUserStatusDb(userPhoneNumber, newStatus);
}

function deleteUser(userPhoneNumber) {
    deleteUserDb(userPhoneNumber);
}

async function updateUserStatusDb(userPhoneNumber, newStatus) {

    try {
        const response = await fetch('http://localhost:5000/users/update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: userPhoneNumber, status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
            await fetchUsers();
        } else {
            console.error("Failed to update user:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteUserDb(userPhoneNumber) {
    try {
        const response = await fetch('http://localhost:5000/users/delete_user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: userPhoneNumber })
        });

        const data = await response.json();
        if (data.success) {
            await fetchUsers();
            console.log(data.message);
        } else {
            console.error("Failed to delete user:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}



/**********************************************profile and dialog code**************************/
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
            const response = await fetch(`http://localhost:5000/uploads/file_upload?uploadType=${uploadType}&phone_number=${userPhoneNumber}`, {
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
    // let urlSearchParams = new URL(window.location.href).searchParams;
    // let userPhoneNumber = urlSearchParams.get('phoneNumber');
    try {
        const response = await fetch(`http://localhost:5000/uploads/get_profile?phoneNumber=${userPhoneNumber}`);
        const profileDetail = await response.json();

        const profileImgElem = document.getElementById('profile-img');

        if (profileDetail.profile_image !== null || profileDetail.profile_image == '') {
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
};


/******************************reports code***************************/
let soilHealthChart = null;
let soilInsights = [];
let currentPage = 1;
const entriesPerPage = 5;

async function addGenerateReportListener() {
    document.getElementById("generateReportButton").addEventListener("click", async () => {
        const reportContent = document.getElementById("reportContent");
        const downloadReportButton = document.getElementById("downloadReportButton");
        const chartCanvas = document.getElementById("soilHealthChart");
        const loadingSpinner = document.getElementById("loadingSpinner");
        const paginationDiv = document.getElementById("pagination");

        try {
            loadingSpinner.classList.remove("hidden");
            reportContent.innerHTML = "";
            paginationDiv.innerHTML = "";
            chartCanvas.style.display = "none";

            const response = await fetch("http://localhost:5000/reports/soil_health_data");
            const { soilInsights: fetchedData } = await response.json();

            soilInsights = fetchedData;
            displayPage(1);
            createChart();

            loadingSpinner.classList.add("hidden");
            downloadReportButton.disabled = false;
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate the report. Please try again.");
            loadingSpinner.classList.add("hidden");
        }
    });
}

function displayPage(page) {
    currentPage = page;
    const start = (page - 1) * entriesPerPage;
    const end = start + entriesPerPage;

    const visibleData = soilInsights.slice(start, end);
    reportContent.innerHTML = `<h2>Soil Health Insights</h2>`;
    visibleData.forEach((soil) => {
        reportContent.innerHTML += `
        <p><strong>Location:</strong> ${soil.location}</p>
        <p><strong>Average pH:</strong> ${Number.parseFloat(soil.phRange).toFixed(2)}</p>
        <p><strong>Moisture Content (%):</strong> ${Number.parseFloat(soil.moistureRange).toFixed(2)}</p>
        <hr />
      `;
    });

    createPagination();
}

function createPagination() {
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";
    const totalPages = Math.ceil(soilInsights.length / entriesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = i === currentPage ? "active" : "";
        button.addEventListener("click", () => displayPage(i));
        paginationDiv.appendChild(button);
    }
}

function createChart() {
    const chartCanvas = document.getElementById("soilHealthChart");
    if (soilHealthChart) soilHealthChart.destroy();

    chartCanvas.style.display = "block";
    const ctx = chartCanvas.getContext("2d");
    soilHealthChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: soilInsights.map((s) => s.location),
            datasets: [
                {
                    label: "Average pH",
                    data: soilInsights.map((s) => s.phRange),
                    backgroundColor: "#4a772f",
                },
                {
                    label: "Moisture (%)",
                    data: soilInsights.map((s) => s.moistureRange),
                    backgroundColor: "#77c34f",
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Soil Health Insights Chart" },
            },
        },
    });
}



async function addDownloadReportListener() {
    document.getElementById("downloadReportButton").addEventListener("click", async () => {
        try {
            const response = await fetch("http://localhost:5000/reports/export_soil_health_data");
            if (!response.ok) throw new Error("Failed to download report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Soil_Health_Report.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download the report. Please try again.");
        }
    });
}

window.addEventListener("beforeunload", (event) => {
    const downloadReportButton = document.getElementById("downloadReportButton");
    downloadReportButton.disabled = true;

});

/*************************************soil data section code*******************************/

let soilData = null;
let selectedLocationName = null;

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


async function displaySoilData(locationName) {
    const soilDataUpdateFormElems = document.getElementById('soil_data_update_form');
    const phMinInputElem = document.getElementById('ph_min');
    const phMaxInputElem = document.getElementById('ph_max');
    const moistureContentMinInputElem = document.getElementById('moisture_content_min');
    const moistureContentMaxInputElem = document.getElementById('moisture_content_max');

    try {
        if (locationName != '') {
            // provide a path parameter to get back soil data for the specific [locationName]
            const response = await fetch(`http://localhost:5000/soil/get_soil_data/${locationName}`);
            soilData = await response.json();

            phMinInputElem.value = soilData.ph_range_min;
            phMaxInputElem.value = soilData.ph_range_max;
            moistureContentMinInputElem.value = soilData.moisture_content_min;
            moistureContentMaxInputElem.value = soilData.moisture_content_max;

        }

        else if (locationName === '') {
            soilDataUpdateFormElems.reset();
        }

    } catch (error) {
        console.error('Error', error);
    }

}

async function addLocationSelectionListener() {
    const selectElem = document.getElementById('location');
    selectElem.addEventListener('change', function (event) {
        selectedLocationName = event.target.value;
        displaySoilData(selectedLocationName);
    });

}

async function addUpdateSoilDataListener() {
    const updateSoilDataElems = document.getElementById('submit_soil_update_btn');
    const soilDataUpdateFormElems = document.getElementById('soil_data_update_form');

    updateSoilDataElems.addEventListener('click', async function (event) {
        event.preventDefault();

        if (soilData == null) {
            alert('please select a location');
            return;
        }

        const phMinValue = document.getElementById('ph_min').value;
        const phMaxValue = document.getElementById('ph_max').value;
        const moistureContentMinValue = document.getElementById('moisture_content_min').value;
        const moistureContentMaxValue = document.getElementById('moisture_content_max').value;

        const partialSoilData = { phMinValue, phMaxValue, moistureContentMinValue, moistureContentMaxValue };

        try {
            // provide a path parameter to update soil data for the specific [soil_id]
            const response = await fetch(`http://localhost:5000/soil/update_soil_data/${soilData.soil_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partialSoilData)
            });

            if (response.ok) {
                alert(`soil data for ${selectedLocationName} updated successfully`);
                soilDataUpdateFormElems.reset();
            }

        } catch (error) {
            console.error('Error:', error);

        }
    });

}

/********************** navigation code *******************************************************************************/

async function addHrefNavigationPaths(userEmailSearchParam) {

    const logOutAnchors = document.querySelectorAll('.logout-anchor-btn');
    logOutAnchors.forEach((anchor, _) => {
        // add home route without any logged in user as search param to simulate logout functionality
        anchor.href = `/home`;
    });

}



