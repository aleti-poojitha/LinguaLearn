import express from 'express';
import axios from 'axios';

const router = express.Router();
const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'https://lingualearn-tts.onrender.com';

router.post('/tts', async (req, res) => {
  const { text, lang, language } = req.body;
  const ttsLang = lang || language;
  if (!text || !ttsLang) {
    return res.status(400).json({ error: 'Missing text or language.' });
  }
  try {
    const response = await axios.post(
      `${TTS_SERVICE_URL}/speak`,
      { text, lang: ttsLang },
      { responseType: 'stream' }
    );
    res.set('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'TTS generation failed.', details: error.message });
  }
});

export default router;