import express from 'express';
import fetch from 'node-fetch';
import db_connection from '../../connection.js';
import 'dotenv/config';

const router = express.Router();

router.get('/crop_recommendation', async (req, res) => {
    const location = req.query.location;
    if (!location) return res.status(400).json({ error: 'Location is required' });

    try {
        // Fetch location data
        const [locationRows] = await db_connection.query(
            'SELECT latitude, longitude, soil_id FROM location WHERE location_name = ?',
            [location]
        );

        if (locationRows.length === 0) return res.status(404).json({ error: 'Location not found' });

        const locData = locationRows[0];

        // Fetch weather data from OpenWeather API
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${locData.latitude}&lon=${locData.longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        //const timestamp = weatherData.dt;
        // create the date the weather was fetched.
        const date = new Date();
        const readableDate = date.toLocaleDateString('en-GB', {
            weekday: 'long', // e.g., "Monday"
            year: 'numeric', // e.g., "2025"
            month: 'long',   // e.g., "March"
            day: 'numeric',  // e.g., "26"
        });

        // Fetch soil data
        const [soilRows] = await db_connection.query('SELECT * FROM soildata WHERE soil_id = ?', [locData.soil_id]);
        const soilData = soilRows[0];

        // Fetch suitable crops
        const [cropRows] = await db_connection.query(
            'SELECT name FROM crops WHERE crop_id IN (SELECT crop_id FROM soilcropmapping WHERE soil_id = ?)',
            [locData.soil_id]
        );

        // Send data as response
        res.json({
            weather: {
                time: readableDate,
                temp: weatherData.main.temp,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon
            },
            soil: {
                type: soilData.type,
                ph_min: soilData.ph_range_min,
                ph_max: soilData.ph_range_max,
                moisture_min: soilData.moisture_content_min,
                moisture_max: soilData.moisture_content_max
            },
            crops: cropRows.map(row => row.name)
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/crop_suitability', async (req, res) => {
    const { location } = req.query;

    try {
        // Get location details
        const [locationData] = await db_connection.query(
            `SELECT * FROM location WHERE location_name = ?`,
            [location]
        );

        if (!locationData.length) return res.status(404).json({ error: 'Location not found' });

        const { latitude, longitude, soil_id } = locationData[0];

        // Fetch soil data
        const [soilData] = await db_connection.query(
            `SELECT * FROM soildata WHERE soil_id = ?`,
            [soil_id]
        );

        // Fetch crops suitable for the soil
        const [cropMapping] = await db_connection.query(
            `SELECT crop_id FROM soilcropmapping WHERE soil_id = ?`,
            [soil_id]
        );

        const cropIds = cropMapping.map(row => row.crop_id);

        const [crops] = await db_connection.query(
            `SELECT * FROM crops WHERE crop_id IN (?)`,
            [cropIds]
        );

        // Fetch weather data
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        // Prepare crop data response
        const cropData = crops.map(crop => ({
            name: crop.name,
            time_to_harvest: `${crop.time_to_harvest_min}-${crop.time_to_harvest_max}`,
        }));

        res.json({
            location: locationData[0],
            soil: soilData[0],
            weather: {
                temperature: weatherData.main.temp,
                condition: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
            },
            crops: cropData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;