import express from 'express';
import translate from '../utils/translate.js';

const router = express.Router();

// POST /api/translate
router.post('/translate', async (req, res) => {
  const { text, target } = req.body;
  if (!text || !target) {
    return res.status(400).json({ error: 'Missing text or target language.' });
  }
  try {
    const [translation] = await translate.translate(text, target);
    res.json({ translation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 