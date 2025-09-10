import express from 'express';
import path from 'path';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './backend/routes/auth.js';
import userRoutes from './backend/routes/users.js';
import uploadRoutes from './backend/routes/uploads.js';
import recommendationRoutes from './backend/routes/recommendation.js';
import reportRoutes from './backend/routes/reports.js';
import mailRoutes from './backend/routes/mails.js';
import locationRouters from './backend/routes/locations.js';
import soilRouters from './backend/routes/soil.js';

import creditRoutes from './backend/routes/credit.js';
import db_connection from './connection.js';


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/uploads', uploadRoutes);
app.use('/recommendation', recommendationRoutes);
app.use('/reports', reportRoutes);
app.use('/mails', mailRoutes);
app.use('/locations', locationRouters);
app.use('/soil', soilRouters);

app.use('/credit', creditRoutes)


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// serves static media files when a request starts with /media
app.use('/media', express.static(path.join(__dirname, '/frontend/media')));
// serves static uploaded files when a request starts with /content_uploads
app.use('/backend/content_uploads', express.static(path.join(__dirname, '/backend/content_uploads')));

// serves static uploaded profile images when a request starts with /profile_uploads
app.use('/backend/profile_uploads', express.static(path.join(__dirname, '/backend/profile_uploads')));

// serves static uploaded emails attachment when a request starts with /mail_attachment_uploads
app.use('/backend/mail_attachment_uploads', express.static(path.join(__dirname, '/backend/mail_attachment_uploads')));


// serves static credit uploads
app.use('/backend/credit_uploads', express.static(path.join(__dirname, '/backend/credit_uploads')));

// home page
app.use(express.static(path.join(__dirname, 'frontend/home')));
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/home/index.html'));
});


// login page
app.use(express.static(path.join(__dirname, 'frontend/login')));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/login/index.html'));
});

// signup page
app.use(express.static(path.join(__dirname, 'frontend/signup')));
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/signup/index.html'));
});

// about page
app.use(express.static(path.join(__dirname, 'frontend/about_contact-us_faq')));
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/about_contact-us_faq/index.html'));
});

// community page
app.use(express.static(path.join(__dirname, 'frontend/community')));
app.get('/community', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/community/index.html'));
});

// blog page
app.use(express.static(path.join(__dirname, 'frontend/blog')));
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/blog/index.html'));
});

// crop recommendation page 
app.use(express.static(path.join(__dirname, 'frontend/crop_recommendation')));
app.get('/crop_recommendation', (req, res) => {
    const { phoneNumber } = req.query;
    // if (phoneNumber === undefined) res.redirect('/login');
    res.sendFile(path.join(__dirname, 'frontend/crop_recommendation/index.html'));
});


// credit service page
app.use(express.static(path.join(__dirname, 'frontend/credit_service')));
app.get('/credit_service', (req, res) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
        return res.redirect('/login'); // Redirect if no phone number is provided
    }
    res.sendFile(path.join(__dirname, 'frontend/credit_service/index.html'));
});


// admin page
app.use(express.static(path.join(__dirname, 'frontend/admin_dashboard')));
app.get('/admin_dashboard', async (req, res) => {
    const { phoneNumber } = req.query;


    if (!phoneNumber) {
        return res.redirect('/login'); // Redirect if no phone number is provided
    }

    // Check if the phone number exists in the database
    const [users] = await db_connection.query(
        "SELECT phone_number FROM users WHERE phone_number = ?",
        [phoneNumber]
    );

    if (users.length === 0) {
        return res.redirect('/login'); // Redirect if phone number is not found
    }

    res.sendFile(path.join(__dirname, 'frontend/admin_dashboard/index.html'));
});

export default app; 