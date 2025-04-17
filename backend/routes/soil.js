import express from 'express';
import db_connection from '../../connection.js';

const router = express.Router();

router.get("/get_soil_data/:location_name", async function (req, res) {
    const location_name = req.params.location_name;
    try {
        const [soilData] = await db_connection.query("SELECT * FROM soildata WHERE soil_id IN (SELECT soil_id FROM location WHERE location_name = ?)", [location_name]);
        res.json(soilData[0]);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/update_soil_data/:soil_id", async function (req, res) {
    const soil_id = req.params.soil_id;
    const partialSoilData = req.body;

    try {
        const [result] = await db_connection.query(
            "UPDATE soildata SET ph_range_min = ?, ph_range_max = ?, moisture_content_min = ?, moisture_content_max = ?  WHERE soil_id = ?",
            [partialSoilData.phMinValue, partialSoilData.phMaxValue, partialSoilData.moistureContentMinValue, partialSoilData.moistureContentMaxValue, soil_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `soil data for id: ${soil_id} not found` });
        }

        res.status(200).json();
    } catch (error) {
        console.error('Error', error);
    }
});



export default router;