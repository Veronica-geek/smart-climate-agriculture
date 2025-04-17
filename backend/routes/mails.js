import express from 'express';
import multer from "multer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import 'dotenv/config';

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "backend/mail_attachment_uploads/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    }
});

const upload = multer({ storage });

// Email Sending Route
router.post("/send_email", upload.single("attachment"), async (req, res) => {
    try {
        const { firstName, lastName, email, description } = req.body;
        const file = req.file;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.GMAIL_USER,
            subject: "New Contact Form Submission",
            text: `You have received a new message from:
                Name: ${firstName} ${lastName}
                Email: ${email}
                Message: ${description}`,
            attachments: file ? [{ filename: file.filename, path: file.path }] : []
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Error sending message" });
    }
});


export default router;