import express from 'express';
import { createBirthCertificate, getBirthCertificates } from '../controllers/birthController.js';
import { createDeathCertificate, getDeathCertificates } from '../controllers/deathController.js';
import { verifyCertificate, getSystemStats, getBlocks } from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registrar-only protected routes for certificate creation and listing
router.post('/birth', protect, createBirthCertificate);
router.get('/birth', protect, getBirthCertificates);

router.post('/death', protect, createDeathCertificate);
router.get('/death', protect, getDeathCertificates);

// Public routes for verification checks and statistics
router.get('/verify/:hash', verifyCertificate);
router.get('/stats', getSystemStats);
router.get('/blocks', getBlocks);

export default router;

