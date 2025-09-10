import express from 'express';
import db_connection from '../../connection.js';

const router = express.Router();
router.get('/get_users', async (req, res) => {
    try {
        const [users] = await db_connection.query("SELECT * FROM users");
        res.json(users);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/get_user_status', async (req, res) => {
    try {
        let phoneNumber = req.query.phoneNumber;

        const [users] = await db_connection.query(
            "SELECT status FROM users WHERE phone_number = ?",
            [phoneNumber]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "No user exist for the given phone number" });
        }

        const user = users[0];

        res.json({ status: user.status });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/update_user', async (req, res) => {
    try {
        const { phoneNumber, status } = req.body;

        if (!phoneNumber || !status) {
            return res.status(400).json({ message: "user's phone number and status are required" });
        }

        // Update the user's status in the database
        const [result] = await db_connection.query(
            "UPDATE users SET status = ? WHERE phone_number = ?",
            [status, phoneNumber]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: `User with phone number: ${phoneNumber} status updated to ${status}`, status, success: true });

    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.delete('/delete_user', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: "phone number is required" });
        }

        // Delete the user from the database
        const [result] = await db_connection.query(
            "DELETE FROM users WHERE phone_number = ?",
            [phoneNumber]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: `User with phone number: ${phoneNumber} deleted successfully`, success: true });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;