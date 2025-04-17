import express from 'express';
import db_connection from '../../connection.js';
import bcrypt from 'bcrypt';

const router = express.Router();
router.post('/signup', async (req, res) => {
    try {
        const { username, email, phoneNumber, password } = req.body;

        // Query database using a promise-based connection
        const [existingUser] = await db_connection.query(
            "SELECT * FROM users WHERE phone_number = ? OR username = ?",
            [phoneNumber, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db_connection.query(
            "INSERT INTO users (username, email, phone_number, password) VALUES (?, ?, ?, ?)",
            [username, email, phoneNumber, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;


        // Check if user exists
        const [users] = await db_connection.query(
            "SELECT user_id, username, email, phone_number, role, profile_image, status, password FROM users WHERE phone_number = ?",
            [phoneNumber]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid phone number or password" });
        }

        const user = users[0];

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid phone number or password" });
        }

        // Return user data (excluding password)
        res.json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
                profile_image: user.profile_image,
                status: user.status,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


export default router;