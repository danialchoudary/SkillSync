import { checkEmailHealth } from '../services/healthService.js';

export async function getEmailHealth(req, res) {
  try {
    await checkEmailHealth();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(503).json({ ok: false, error: err.message });
  }
}
