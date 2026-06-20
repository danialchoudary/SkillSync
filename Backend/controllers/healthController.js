import mongoose from 'mongoose';
import { checkSmsHealth, getDatabaseStats } from '../services/healthService.js';

export async function getSmsHealth(req, res) {
  try {
    const stats = await checkSmsHealth();
    return res.json({ ok: true, ...stats });
  } catch (err) {
    return res.status(503).json({ ok: false, error: err.message });
  }
}

export async function getDatabaseHealth(req, res) {
  try {
    const stats = await getDatabaseStats();
    return res.json({
      ok: true,
      dbName: mongoose.connection.name || stats.dbName,
      collections: stats.collections,
    });
  } catch (err) {
    return res.status(503).json({ ok: false, error: err.message });
  }
}
