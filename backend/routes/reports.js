import express from 'express';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import PDFDocument from 'pdfkit';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db_connection from '../../connection.js';
import 'dotenv/config';

const router = express.Router();

router.get("/soil_health_data", async (req, res) => {
    try {

        const [soilInsights] = await db_connection.query(`
        SELECT l.location_name AS location,
               AVG(s.ph_range_min + s.ph_range_max) / 2 AS phRange,
               AVG(s.moisture_content_min + s.moisture_content_max) / 2 AS moistureRange
        FROM soildata s
        JOIN location l ON s.soil_id = l.soil_id
        GROUP BY l.location_id
      `);

        res.json({ soilInsights });
    } catch (error) {
        console.error("Error fetching soil health data:", error);
        res.status(500).json({ error: "Failed to fetch soil health data." });
    }
});



const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get("/export_soil_health_data", async (req, res) => {
    try {
        const [soilInsights] = await db_connection.query(`
      SELECT l.location_name AS location,
             AVG(s.ph_range_min + s.ph_range_max) / 2 AS phRange,
             AVG(s.moisture_content_min + s.moisture_content_max) / 2 AS moistureRange
      FROM soildata s
      JOIN location l ON s.soil_id = l.soil_id
      GROUP BY l.location_id
    `);

        // Generate bar chart
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
        const chartData = {
            labels: soilInsights.map((soil) => soil.location),
            datasets: [
                {
                    label: 'Average pH',
                    data: soilInsights.map((soil) => soil.phRange),
                    backgroundColor: '#4a772f',
                },
                {
                    label: 'Moisture Content (%)',
                    data: soilInsights.map((soil) => soil.moistureRange),
                    backgroundColor: '#77c34f',
                },
            ],
        };

        const chartOptions = {
            plugins: {
                legend: { position: 'top' },
            },
            responsive: false,
            scales: {
                y: { beginAtZero: true },
            },
        };

        const chartBuffer = await chartJSNodeCanvas.renderToBuffer({
            type: 'bar',
            data: chartData,
            options: chartOptions,
        });

        // Create PDF
        const doc = new PDFDocument();
        const pdfPath = "soil_health_report.pdf";

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${pdfPath}`);
        doc.pipe(res);

        doc.fontSize(18).text("Soil Health Report", { align: "center" }).moveDown();

        // Add chart to PDF
        const chartPath = path.join(__dirname, 'soil_health_chart.png');
        await fs.writeFile(chartPath, chartBuffer);
        doc.image(chartPath, { fit: [500, 300], align: 'center' }).moveDown();

        doc.end();

        // Clean up temp chart
        await fs.unlink(chartPath);
    } catch (error) {
        console.error("Error exporting soil report:", error);
        res.status(500).json({ error: "Failed to export soil report." });
    }
});


// router.get('/export_crop_recommendation_data', async (req, res) => {
//     const { location } = req.query;

//     if (!location) return res.status(400).json({ error: 'Location is required' });

//     try {
//         // Fetch the necessary data for the PDF
//         const [locationData] = await db_connection.query(
//             `SELECT * FROM location WHERE location_name = ?`,
//             [location]
//         );

//         if (!locationData.length) return res.status(404).json({ error: 'Location not found' });

//         const { latitude, longitude, soil_id } = locationData[0];

//         const [soilData] = await db_connection.query(
//             `SELECT * FROM soildata WHERE soil_id = ?`,
//             [soil_id]
//         );

//         const [cropMapping] = await db_connection.query(
//             `SELECT crop_id FROM soilcropmapping WHERE soil_id = ?`,
//             [soil_id]
//         );

//         const cropIds = cropMapping.map(row => row.crop_id);

//         const [crops] = await db_connection.query(
//             `SELECT * FROM crops WHERE crop_id IN (?)`,
//             [cropIds]
//         );

//         const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
//         const weatherData = await weatherResponse.json();

//         // Generate Chart
//         const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
//         const labels = crops.map(crop => crop.name);
//         const data = crops.map(crop => {
//             const timToHarvestMin = crop.time_to_harvest_min;
//             const time_ToHarvestMax = crop.time_to_harvest_max;

//             return (timToHarvestMin + time_ToHarvestMax) / 2;
//         });

//         const chartConfig = {
//             type: 'bar',
//             data: {
//                 labels,
//                 datasets: [{
//                     label: 'Average Time to Harvest (Days)',
//                     data,
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     borderColor: 'rgba(75, 192, 192, 1)',
//                     borderWidth: 1,
//                 }],
//             },
//             options: {
//                 responsive: true,
//                 plugins: {
//                     legend: {
//                         display: true,
//                     },
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         title: {
//                             display: true,
//                             text: 'Time to Harvest (Days)',
//                         },
//                     },
//                     x: {
//                         title: {
//                             display: true,
//                             text: 'Crops',
//                         },
//                     },
//                 },
//             },
//         };


//         const chartImage = await chartJSNodeCanvas.renderToBuffer(chartConfig);

//         // Generate PDF
//         const doc = new PDFDocument();
//         const pdfPath = `crop_recommendation_report_for_${location}.pdf`;
//         const stream = fs.createWriteStream(pdfPath);

//         doc.pipe(stream);

//         doc.fontSize(16).text('Crop Recommendation Report', { align: 'center' });
//         doc.moveDown();
//         doc.fontSize(12).text(`Location: ${location}`);
//         doc.text(`Weather: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C`);
//         doc.text(`Soil Type: ${soilData[0].type}`);
//         doc.text(`Soil pH: ${soilData[0].ph_range_min} - ${soilData[0].ph_range_max}`);
//         doc.text(`Soil Moisture: ${soilData[0].moisture_content_min}% - ${soilData[0].moisture_content_max}%`);
//         doc.moveDown();

//         doc.text('Suitable Crops:');
//         crops.forEach(crop => {
//             doc.text(`- ${crop.name} (Harvest Time: ${crop.time_to_harvest_min} - ${crop.time_to_harvest_max} days)`);
//         });

//         doc.addPage();
//         doc.text('Average Time to Harvest Chart:');
//         doc.image(chartImage, { fit: [500, 300], align: 'center', valign: 'center' });

//         doc.end();

//         stream.on('finish', () => {
//             res.download(pdfPath, () => {
//                 fs.unlinkSync(pdfPath); // Clean up the file after download
//             });
//         });
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });






router.get("/export_crop_recommendation_data", async (req, res) => {
    const { location } = req.query;
    if (!location) return res.status(400).json({ error: 'Location is required' });

    try {
        // 1. Retrieve location data
        const [locationRows] = await db_connection.query(
            'SELECT latitude, longitude, soil_id FROM location WHERE location_name = ?',
            [location]
        );
        if (!locationRows.length) return res.status(404).json({ error: 'Location not found' });
        const locData = locationRows[0];

        // 2. Retrieve soil data for that location
        const [soilRows] = await db_connection.query(
            'SELECT * FROM soildata WHERE soil_id = ?',
            [locData.soil_id]
        );
        const soilData = soilRows[0];

        // 3. Retrieve suitable crops via soilcropmapping and crop data
        const [cropMapping] = await db_connection.query(
            'SELECT crop_id FROM soilcropmapping WHERE soil_id = ?',
            [locData.soil_id]
        );
        const cropIds = cropMapping.map(row => row.crop_id);
        const [crops] = await db_connection.query(
            'SELECT * FROM crops WHERE crop_id IN (?)',
            [cropIds]
        );

        // 4. Calculate average time to harvest for each crop
        const cropData = crops.map(crop => {
            const avgHarvest = (Number(crop.time_to_harvest_min) + Number(crop.time_to_harvest_max)) / 2;
            return { name: crop.name, avgHarvest };
        });

        // 5. Fetch weather data from OpenWeather API
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


        // 6. Generate a chart image using chartjs-node-canvas
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });
        const chartConfig = {
            type: 'bar',
            data: {
                labels: cropData.map(c => c.name),
                datasets: [{
                    label: 'Average Harvest Time (Days)',
                    data: cropData.map(c => c.avgHarvest),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Crop Suitability Chart'
                    }
                }
            }
        };
        const chartBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);

        // 7. Create PDF using pdfkit (we'll generate in memory)
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=crop_recommendation_report_for_${location}.pdf`);
            res.send(pdfData);
        });

        // Add content to PDF
        doc.fontSize(20).text(`Crop Recommendation Report for ${location}`, { align: 'center' });
        doc.moveDown();

        // Weather Section
        doc.fontSize(16).text('Weather:', { underline: true });
        doc.fontSize(14)
            .text(`Time: ${readableDate}`)
            .text(`Condition: ${weatherData.weather[0].description}`, { align: 'left' })
            .text(`Temperature: ${weatherData.main.temp}°C`)

        doc.moveDown();

        // Soil Data Section
        doc.fontSize(16).text('Soil Information:', { underline: true });
        doc.fontSize(14)
            .text(`Soil Type: ${soilData.type}`, { align: 'left' })
            .text(`pH Range: ${soilData.ph_range_min} - ${soilData.ph_range_max}`, { align: 'left' })
            .text(`Moisture Content: ${soilData.moisture_content_min}% - ${soilData.moisture_content_max}%`, { align: 'left' });
        doc.moveDown();

        // Suitable Crops Section
        doc.fontSize(16).text('Suitable Crops:', { underline: true });
        cropData.forEach(crop => {
            doc.fontSize(12).text(`${crop.name} – Avg. Harvest Time: ${crop.avgHarvest} days`);
        });
        doc.moveDown();

        // Add Chart Page
        //doc.addPage();
        doc.fontSize(16).text('Crop Suitability Chart', { align: 'center' });
        doc.moveDown();
        // Embed the generated chart image (ensure it fits without overlapping)
        doc.image(chartBuffer, { fit: [500, 300], align: 'center', valign: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;
