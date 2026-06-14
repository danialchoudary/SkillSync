import express from 'express';
import { getDatabaseHealth, getEmailHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/email', getEmailHealth);
router.get('/db', getDatabaseHealth);

export default router;
