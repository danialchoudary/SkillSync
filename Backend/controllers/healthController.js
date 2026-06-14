import mongoose from 'mongoose';
import { checkEmailHealth, getDatabaseStats } from '../services/healthService.js';

export async function getEmailHealth(req, res) {
  try {
    await checkEmailHealth();
    return res.json({ ok: true });
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
