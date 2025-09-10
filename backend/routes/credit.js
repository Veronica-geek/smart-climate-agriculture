import express from 'express';
import db_connection from '../../connection.js'; // Updated path to root
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../backend/credit_uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Middleware to check authentication and map user_id
const authenticate = async (req, res, next) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const [users] = await db_connection.query('SELECT id FROM users WHERE phone_number = ?', [phoneNumber]);
        if (users.length === 0) return res.status(401).json({ error: 'User not found' });
        req.userId = users[0].id; // Set user_id for insertion
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Step 1: Save Personal Information
router.post('/personal-info', authenticate, async (req, res) => {
    const { fullName, nationalId, dob, phone, email, permanentAddress, nextOfKin } = req.body;
    try {
        const [result] = await db_connection.query(
            'INSERT INTO credit_applications (user_id, full_name, national_id, dob, phone, email, permanent_address, next_of_kin, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending")',
            [req.userId, fullName, nationalId, dob, phone, email, permanentAddress, nextOfKin]
        );
        res.status(201).json({ message: 'Personal info saved', applicationId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save personal info' });
    }
});

// Step 2: Save Farm Details
router.post('/farm-details', authenticate, async (req, res) => {
    const { applicationId, farmLocation, farmSize, farmingType, cooperative, primaryCrops, irrigation } = req.body;
    try {
        await db_connection.query(
            'UPDATE credit_applications SET farm_location = ?, farm_size = ?, farming_type = ?, cooperative = ?, primary_crops = ?, irrigation = ? WHERE application_id = ? AND phone = ?',
            [farmLocation, farmSize, farmingType, cooperative, primaryCrops, irrigation, applicationId, req.query.phoneNumber]
        );
        res.status(200).json({ message: 'Farm details saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save farm details' });
    }
});

// Step 3: Handle Attachments
router.post('/attachments', authenticate, upload.fields([{ name: 'idPhoto' }, { name: 'loanStatement' }]), async (req, res) => {
    const { applicationId } = req.body;
    const idPhotoPath = req.files['idPhoto'] ? req.files['idPhoto'][0].filename : null;
    const loanStatementPath = req.files['loanStatement'] ? req.files['loanStatement'][0].filename : null;
    try {
        await db_connection.query(
            'UPDATE credit_applications SET id_photo_path = ?, loan_statement_path = ? WHERE application_id = ? AND phone = ?',
            [idPhotoPath, loanStatementPath, applicationId, req.query.phoneNumber]
        );
        res.status(200).json({ message: 'Attachments saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save attachments' });
    }
});

// Step 4: Save Credit Request
router.post('/credit-request', authenticate, async (req, res) => {
    const { applicationId, bankAccount, repaymentMethod } = req.body;
    try {
        await db_connection.query(
            'UPDATE credit_applications SET bank_account = ?, repayment_method = ? WHERE application_id = ? AND phone = ?',
            [bankAccount, repaymentMethod, applicationId, req.query.phoneNumber]
        );
        res.status(200).json({ message: 'Credit request saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save credit request' });
    }
});

// Step 5: Handle Consent and Submit
router.post('/consent', authenticate, async (req, res) => {
    const { applicationId, declareTrue, dataConsent, termsAgree } = req.body;
    if (!declareTrue || !dataConsent || !termsAgree) {
        return res.status(400).json({ error: 'All consent fields are required' });
    }
    try {
        await db_connection.query(
            'UPDATE credit_applications SET declare_true = ?, data_consent = ?, terms_agree = ?, status = "submitted" WHERE application_id = ? AND phone = ?',
            [declareTrue, dataConsent, termsAgree, applicationId, req.query.phoneNumber]
        );
        res.status(200).json({ message: 'Application submitted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

export default router;