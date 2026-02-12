import express from 'express';
import { verifyEmailTransport } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/email', async (req, res) => {
  try {
    await verifyEmailTransport();
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

export default router;
