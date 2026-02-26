import express from 'express';
import { getEmailHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/email', getEmailHealth);

export default router;
