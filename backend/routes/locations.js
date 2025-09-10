import express from 'express';
import db_connection from '../../connection.js';

const router = express.Router();

router.get("/get_locations", async function (req, res) {
    try {
        const [locations] = await db_connection.query("SELECT location_name FROM location");
        res.json(locations);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



export default router;