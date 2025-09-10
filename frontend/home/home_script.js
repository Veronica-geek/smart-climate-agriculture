let urlSearchParams = new URL(window.location.href).searchParams;
let phoneNumber = urlSearchParams.get('phoneNumber');

document.addEventListener("DOMContentLoaded", async function () {
    await disableLoginSignUpIfUserLoggedIn(phoneNumber);
    await addHrefNavigationPaths(phoneNumber);
    disableLogoutIfUserNotLoggedIn(phoneNumber);
    setupCreditLinkBehavior(phoneNumber);
});

/**********************navigation code*******************************************************************************/

async function disableLoginSignUpIfUserLoggedIn(userPhoneNumberSearchParam) {
    // Remove sign up and login if the user is currently logged in.
    if (userPhoneNumberSearchParam) {
        const signUpAnchors = document.querySelectorAll('.signup-anchor-btn');
        const loginAnchors = document.querySelectorAll('.login-anchor-btn');

        signUpAnchors.forEach((anchor) => {
            anchor.remove();
        });

        loginAnchors.forEach((anchor) => {
            anchor.remove();
        });
    }
}

async function disableLogoutIfUserNotLoggedIn(userPhoneNumberSearchParam) {
    if (!userPhoneNumberSearchParam) {
        const logoutAnchor = document.querySelector('.logout-anchor-btn');
        if (logoutAnchor) {
            logoutAnchor.remove();
        }
    }
}

async function addHrefNavigationPaths(userPhoneNumberSearchParam) {
    const homeAnchors = document.querySelectorAll('.home-anchor-btn');
    homeAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? `/home?phoneNumber=${encodeURIComponent(userPhoneNumberSearchParam)}` : "/home";
    });

    const blogAnchors = document.querySelectorAll('.blog-anchor-btn');
    blogAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? `/blog?phoneNumber=${encodeURIComponent(userPhoneNumberSearchParam)}` : "/blog";
    });

    const aboutAnchors = document.querySelectorAll('.about-anchor-btn');
    aboutAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? `/about?phoneNumber=${encodeURIComponent(userPhoneNumberSearchParam)}` : "/about";
    });

    const cropRecommendationAnchors = document.querySelectorAll('.crop-recom-anchor-btn');
    cropRecommendationAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? `/crop_recommendation?phoneNumber=${encodeURIComponent(userPhoneNumberSearchParam)}` : "/login";
    });

    const loginAnchors = document.querySelectorAll('.login-anchor-btn');
    loginAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? "#" : "/login"; // Disable if logged in
    });

    const signupAnchors = document.querySelectorAll('.signup-anchor-btn');
    signupAnchors.forEach((anchor) => {
        anchor.href = userPhoneNumberSearchParam ? "#" : "/signup"; // Disable if logged in
    });

    const logoutAnchors = document.querySelectorAll('.logout-anchor-btn');
    logoutAnchors.forEach((anchor) => {
        anchor.href = `/home`; // Logout clears phoneNumber
    });
}

function setupCreditLinkBehavior(userPhoneNumberSearchParam) {
    const creditLink = document.querySelector('.credit-service-anchor-btn');
    if (creditLink) {
        creditLink.addEventListener('click', (e) => {
            if (!userPhoneNumberSearchParam) {
                e.preventDefault();
                alert('Please log in to access the Credit service.');
            } else {
                window.location.href = `/credit_service?phoneNumber=${encodeURIComponent(userPhoneNumberSearchParam)}`;
            }
        });
    }
}