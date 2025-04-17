document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("login_button");

    loginButton.addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get input values
        const phoneNumber = document.getElementById("phone-number").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic validation
        if (!phoneNumber || !password) {
            alert("Please fill in both phone number and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                // Redirect or handle successful login

                window.location.href = data.user.role === "admin" ? `/admin_dashboard?phoneNumber=${data.user.phone_number}` : `/crop_recommendation?phoneNumber=${data.user.phone_number}`;

            } else {
                alert(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});
