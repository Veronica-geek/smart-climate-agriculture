let urlSearchParams = new URL(window.location.href).searchParams;
let userPhoneNumber = urlSearchParams.get('phoneNumber');

document.addEventListener('DOMContentLoaded', async function () {
    await disableLoginSignUpIfUserLoggedIn(userPhoneNumber);
    await addHrefNavigationPaths(userPhoneNumber);
    disableLogoutIfUserNotLoggedIn(userPhoneNumber);
    addContactFormListener();

});



/********************** navigation code *******************************************************************************/


async function disableLoginSignUpIfUserLoggedIn(userPhoneNumberSearchParam) {
    // remove sign up and login if the user is currently logged in.
    if (userPhoneNumberSearchParam) {
        const signUpAnchors = document.querySelectorAll('.signup-anchor-btn');
        const loginAnchors = document.querySelectorAll('.login-anchor-btn');


        signUpAnchors.forEach((anchor, _) => {
            anchor.remove();
        });

        loginAnchors.forEach((anchor, _) => {
            anchor.remove();
        });

        // disable sign up button
        // signUpAnchors.forEach((anchor, _) => {
        //     anchor.style.pointerEvents = 'none'; // Prevent interaction
        //     anchor.style.opacity = '0.5';
        // });

        //disable login button
        // loginAnchors.forEach((anchor, _) => {
        //     anchor.style.pointerEvents = 'none'; // Prevent interaction
        //     anchor.style.opacity = '0.5';
        // });

    }
}





async function addHrefNavigationPaths(userPhoneNumberSearchParam) {
    const homeAnchors = document.querySelectorAll('.home-anchor-btn');
    homeAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ? `/home?phoneNumber=${userPhoneNumberSearchParam}` : "/home";
    });


    const blogAnchors = document.querySelectorAll('.blog-anchor-btn');
    blogAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ? `/blog?phoneNumber=${userPhoneNumberSearchParam}` : "/blog";
    });

    const aboutAnchors = document.querySelectorAll('.about-anchor-btn');
    aboutAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ? `/about?phoneNumber=${userPhoneNumberSearchParam}` : "/about";
    });

    const loginAnchors = document.querySelectorAll('.login-anchor-btn');
    loginAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ?? '/login';
    });
    const signupAnchors = document.querySelectorAll('.signup-anchor-btn');
    signupAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ?? "/signup";
    });

    const crop_recommendationAnchors = document.querySelectorAll('.crop_recommendation-anchor-btn');
    crop_recommendationAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ? `/crop_recommendation?phoneNumber=${userPhoneNumberSearchParam}` : "/login";
    });


    const logOutAnchors = document.querySelectorAll('.logout-anchor-btn');
    logOutAnchors.forEach((anchor, _) => {
        // add home route without any logged in user as search param to simulate logout functionality
        anchor.href = `/home`;
    });

}


function addContactFormListener() {
    document.querySelector(".contact-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("firstName", document.getElementById("firstName").value);
        formData.append("lastName", document.getElementById("lastName").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("description", document.getElementById("description").value);

        const fileInput = document.getElementById("attachment");
        if (fileInput.files.length > 0) {
            formData.append("attachment", fileInput.files[0]);
        }

        try {
            const response = await fetch("http://localhost:5000/mails/send_email", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Error sending message");
        }
    });
}

async function disableLogoutIfUserNotLoggedIn(userPhoneNumberSearchParam) {

    if (userPhoneNumberSearchParam === null) {
        const logoutAnchor = document.querySelector('.logout-anchor-btn');
        logoutAnchor.remove();

    }
}
