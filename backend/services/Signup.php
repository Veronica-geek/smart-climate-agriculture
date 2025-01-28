<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign up - Terraaly</title>
    <style>
        body, html {
            height: 100%;
            margin: 0;
            font-family: Arial, sans-serif;
        }

        .signup-container {
            height: 100%;
            display: flex;
        }

        .left-panel {
            flex: 1;
            background: linear-gradient(to bottom right, #8fcf81, #a7d795);
            color: #FFFFFF;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .right-panel {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #FFF;
        }

        .signup-form {
            width: 80%;
            max-width: 400px;
            padding: 20px;
        }

        .signup-form h2 {
            color: #4a7c59;
            margin-bottom: 20px;
        }

        .input-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            color: #333;
        }

        input[type="email"], input[type="password"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .btn-signup {
            width: 100%;
            padding: 10px;
            background-color: #4a7c59;
            color: #FFFFFF;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .btn-signup:hover {
            background-color: #3a6247;
        }

        .social-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }

        .social-button {
            padding: 10px;
            border: none;
            border-radius: 4px;
            text-align: center;
            color: #FFFFFF;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        .social-button:hover {
            opacity: 0.8;
        }

        .google {
            background-color: #db4437;
        }

        .facebook {
            background-color: #4267b2;
        }

        .default {
            background-color: #e2e2e2;
            color: #333;
        }

        .error {
            color: #db4437;
            margin-top: 10px;
        }

        a {
            color: #4a7c59;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="signup-container">
        <div class="left-panel">
            <h1>Welcome to Terraaly</h1>
            <p>Empower your farming with smart solutions.</p>
        </div>
        <div class="right-panel">
            <div class="signup-form">
                <h2>Sign up</h2>
                <form action="login.php" method="POST">
                    <div class="input-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="input-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-signup">Sign up</button>
                </form>
                <div class="social-buttons">
                    <button class="social-button google">Sign up with Google</button>
                    <button class="social-button facebook">Sign up with Facebook</button>
                    <button class="social-button default">Sign up with Email</button>
                </div>
                <p class="error">Don't have an account? <a href="register.php">Sign up</a> now!</p>
            </div>
        </div>
    </div>
</body>
</html>