let urlSearchParams = new URL(window.location.href).searchParams;
let userPhoneNumber = urlSearchParams.get('phoneNumber');

let articleViewer;
let articleList;
let toggleSidebar;
let articles = [];

document.addEventListener('DOMContentLoaded', async function () {
    await disableLoginSignUpIfUserLoggedIn(userPhoneNumber);
    await addHrefNavigationPaths(userPhoneNumber);

    articleViewer = document.getElementById("articleViewer");
    articleList = document.getElementById("articleList");
    toggleSidebar = document.getElementById("toggleSidebar");

    fetchArticles();
    disableLogoutIfUserNotLoggedIn(userPhoneNumber);
});



// Fetch articles from the server
async function fetchArticles() {

    try {
        const response = await fetch('http://localhost:5000/uploads/get_files');

        if (response.status === 404) {
            articles = [];
        } else {
            const files = await response.json();
            articles = files;
        }

        displayArticleList();

    } catch (error) {
        console.error("Error fetching articles:", error);
    }
}

// Display the article list in the sidebar
function displayArticleList() {
    articleList.innerHTML = "";
    articleViewer.innerHTML = "";

    if (articles.length === 0) {
        articleList.innerHTML = "<li>No Article uploaded</li>";
        articleViewer.innerHTML = "<p> No Article to be display</p>";
        return;
    }

    articles.forEach((article, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a style="color: #fff" href="#" data-index="${index}">${article.title}</a>`;
        listItem.addEventListener("click", (event) => {
            event.preventDefault();
            displayArticle(index);
        });
        articleList.appendChild(listItem);
    });

    loadDefaultArticle();
}

// Display the selected article in the iframe
function displayArticle(index) {
    const article = articles[index];
    articleViewer.src = `http://localhost:5000/backend${article.file_path}`;

    highlightActiveArticle(index);
}

// Load the first article by default
function loadDefaultArticle() {
    if (articles.length > 0) {
        displayArticle(0);
        highlightActiveArticle(0);
    }
}

// highlight current active article
function highlightActiveArticle(index) {
    const links = articleList.querySelectorAll("a");
    links.forEach((link, i) => {
        if (i === index) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}


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