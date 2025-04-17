document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("sign-up-form");

    submitButton.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect input values
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const phoneNumber = document.getElementById("phone-number").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Validation
        if (!username) {
            alert("please choose a username!");
            return;
        }

        if (email !== '' && !validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            alert('Invalid phone number. It must be 10 digits and start with 07 or 01.');
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Prepare data for backend
        const formData = { username, email, phoneNumber, password };

        try {
            const response = await fetch("http://localhost:5000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Signup successful! Redirecting...");
                window.location.href = "/login"; // Change to desired redirect page
            } else {
                alert(result.message || "Signup failed, please try again.");
            }
        } catch (error) {
            console.error("Error signing up:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});


function validateEmail(email) {
    const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegexPattern.test(email);
}

function validatePhoneNumber(phoneNumber) {
    const phoneNumberRegexPattern = /^(07|01)\d{8}$/;
    return phoneNumberRegexPattern.test(phoneNumber);
}