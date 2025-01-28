<?php
session_start();
require_once 'db.php'; // Include database connection file

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if we're using HTTPS
    if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
        die('This script must be run with HTTPS.');
    }

    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $password = trim($_POST['password']);

    if (!empty($email) && !empty($password)) {
        // CSRF token check
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            die('Invalid CSRF token.'); // This should be more user-friendly in practice
        }

        // Prepare and execute the SQL query
        $stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ?");
        if ($stmt === false) {
            die('An error occurred preparing the query.');
        }
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Verify password
            if (password_verify($password, $user['password'])) {
                // Regenerate session ID to prevent session fixation
                session_regenerate_id(true);

                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                header("Location: dashboard.php"); // Redirect to a dashboard page
                exit();
            }
        }
        $error = "Invalid email or password."; // Generic error message
        $stmt->close();
    } else {
        $error = "Please fill in all fields.";
    }
}
// Generate CSRF token if not set
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Terraaly</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="login-container">
    <div class="right-panel">
        <h2>Login</h2>
        <form action="login.php" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token']); ?>">
            <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn-login">Login</button>
        </form>
        <?php if (!empty($error)) echo "<p class='error'>" . htmlspecialchars($error) . "</p>"; ?>
    </div>
</div>
</body>
</html>