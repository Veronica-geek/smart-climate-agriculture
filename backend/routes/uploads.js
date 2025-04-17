import express from 'express';
import multer from 'multer';
import path from 'path';
import db_connection from '../../connection.js';

const router = express.Router();

// Config Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadType = req.query.uploadType; // Get upload type from query
        let uploadPath = 'backend/content_uploads/'; // Default to content uploads

        if (uploadType === 'profile_image') {
            uploadPath = 'backend/profile_uploads/'; // Save to profile_uploads
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage });


router.post('/file_upload', upload.single('file'), async (req, res) => {

    try {
        const uploadType = req.query.uploadType; // Extract type from query
        const file = req.file;

        if (uploadType === 'profile_image') {
            const { username } = req.body;
            const phoneNumber = req.query.phoneNumber;
            if (!file) return res.status(400).json({ message: "Profile image is required" });
            if (!username) return res.status(400).json({ message: "Username is required" });
            if (!phoneNumber) return res.status(400).json({ message: "phoneNumber is required" });
            let filePath = `/profile_uploads/${file.filename}`;

            await db_connection.query(
                "UPDATE users SET profile_image = ?, username = ? WHERE phone_number = ?",
                [filePath, username, phoneNumber]
            );

        }

        if (uploadType === 'file_document') {
            const { title } = req.body;
            if (!file) return res.status(400).json({ message: "File is required" });
            if (!title) return res.status(400).json({ message: "Title is required" });
            let filePath = `/content_uploads/${file.filename}`;

            await db_connection.query(
                "INSERT INTO content (title, file_path) VALUES (?, ?)",
                [title, filePath]
            );
        }

        res.status(201).json({ messages: "File uploaded successfully" });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/get_profile', async (req, res) => {
    try {
        const phoneNumber = req.query.phoneNumber;
        const [profile] = await db_connection.query("SELECT profile_image, username FROM users WHERE phone_number = ?", [phoneNumber]);

        if (profile.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile[0]);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/get_files', async (req, res) => {
    try {
        const [files] = await db_connection.query("SELECT title, file_path FROM content");

        if (files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }

        res.json(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


export default router;
