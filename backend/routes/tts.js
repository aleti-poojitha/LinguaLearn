import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/tts', async (req, res) => {
  const { text, language } = req.body;
  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language.' });
  }
  try {
    const audioId = uuidv4();
    const audioPath = path.join(__dirname, `../public/tts-${audioId}.mp3`);
    const response = await axios.post(
      'http://localhost:5500/speak',
      { text, language },
      { responseType: 'stream' }
    );
    const writer = fs.createWriteStream(audioPath);
    response.data.pipe(writer);
    writer.on('finish', () => {
      res.json({ audioUrls: [`/tts-${audioId}.mp3`] });
    });
    writer.on('error', () => {
      res.status(500).json({ error: 'TTS generation failed.' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 