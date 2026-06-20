import express from 'express';
import { getDatabaseHealth, getSmsHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/email', getSmsHealth);
router.get('/sms', getSmsHealth);
router.get('/db', getDatabaseHealth);

export default router;
