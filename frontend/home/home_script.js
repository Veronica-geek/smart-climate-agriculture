
let urlSearchParams = new URL(window.location.href).searchParams;
let phoneNumber = urlSearchParams.get('phoneNumber');


document.addEventListener("DOMContentLoaded", async function () {

    await disableLoginSignUpIfUserLoggedIn(phoneNumber);
    await addHrefNavigationPaths(phoneNumber);
    disableLogoutIfUserNotLoggedIn(phoneNumber);
});

/**********************navigation code*******************************************************************************/

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

async function disableLogoutIfUserNotLoggedIn(userPhoneNumberSearchParam) {

    if (userPhoneNumberSearchParam === null) {
        const logoutAnchor = document.querySelector('.logout-anchor-btn');
        logoutAnchor.remove();

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

    const crop_recommendationAnchors = document.querySelectorAll('.crop_recommendation-anchor-btn');
    crop_recommendationAnchors.forEach((anchor, _) => {
        anchor.href = userPhoneNumberSearchParam ? `/crop_recommendation?phoneNumber=${userPhoneNumberSearchParam}` : "/login";
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
        // add home route without any logged in user as search param to simulate logout functionality
        anchor.href = `/home`;
    });

}