import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { generateGeminiQuiz } from '../utils/geminiQuiz.js';
dotenv.config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const GEMINI_API_IMG_KEY = process.env.GEMINI_API_IMG_KEY;
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Language name map for user-friendly instructions
const languageNames = {
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  gu: 'Gujarati',
  bn: 'Bengali'
};

// Helper to call Gemini for text
async function getGeminiText(prompt) {
  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are Lingo, a helpful academic assistant for students. Always provide a detailed, clear, and student-friendly explanation about the given topic. Use simple language and examples where possible. Format your answer using only HTML tags for headings (use a variety of heading sizes like h1, h2, h3, etc. to organize and emphasize content), bold, italic, lists (use <ul> or <ol> and <li> for bullet/numbered lists), and highlights (use <mark> or <span class='highlight'> for important terms or examples). Do not use only line breaks for lists or sections. Do not use any inline styles or CSS. Let the website's CSS control the appearance. Make the answer visually attractive, well-spaced, and easy to read. Do not use Markdown or asterisks.\n\nUser topic: ${prompt}` }] }]
    })
  });
  const data = await res.json();
  console.log('Gemini text API full response:', JSON.stringify(data, null, 2));
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
}

// Helper to call Gemini for image generation
async function getGeminiImage(prompt) {
  const res = await fetch(`${GEMINI_IMAGE_URL}?key=${GEMINI_API_IMG_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  // Try to extract base64 image from response
  const base64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (base64) {
    return `data:image/png;base64,${base64}`;
  }
  // If URL is provided (future-proof)
  const url = data.candidates?.[0]?.content?.parts?.find(p => p.fileData)?.fileData?.fileUri;
  if (url) {
    return url;
  }
  return null;
}

// Placeholder translation function (replace with real API integration)
async function translateText(text, targetLang) {
  // TODO: Integrate with Google Translate or another translation API
  // For now, just return the original text
  return text;
}

// Helper to detect if a string is a short/numeric query
function isShortOrNumericQuery(input) {
  // If input is less than 8 characters and contains only numbers, operators, or whitespace
  return /^[\d\s\*\+\-\/\=\.]+$/.test(input.trim()) && input.trim().length < 8;
}

// Main route
router.post('/', async (req, res) => {
  const { input, language, imagePrompt } = req.body;
  if (!input) return res.status(400).json({ error: 'Missing input' });
  try {
    console.log('Received input:', input);
    let langInstruction = '';
    if (language && language !== 'en') {
      const langName = languageNames[language] || language;
      langInstruction = `No matter what language the question is in, always answer only in ${langName}. Do not use any English words or sentences. If the question is a number or math problem, explain the answer and all steps in ${langName} only.`;
    }
    let processedInput = input;
    // If the query is short/numeric and language is not English, translate it
    if (language && language !== 'en' && isShortOrNumericQuery(input)) {
      processedInput = await translateText(input, language);
    }
    let text = await getGeminiText(`${langInstruction}\n${processedInput}`);
    if (!text || text === 'No answer generated.') {
      text = 'Sorry, I could not generate an explanation for that topic.';
    }
    // Fallback: If Gemini's output is not in the target language, translate it
    if (language && language !== 'en') {
      // Naive check: if output contains mostly English letters, translate
      const nonEnglishRatio = (text.match(/[^\u0000-\u007F]/g) || []).length / text.length;
      if (nonEnglishRatio < 0.2) {
        text = await translateText(text, language);
      }
    }
    let image = null;
    if (imagePrompt) {
      image = await getGeminiImage(imagePrompt);
    }
    
    // Generate a quiz based on the topic explained
    let quiz = null;
    try {
      // Extract the main topic from the input for quiz generation
      const topicForQuiz = input.length > 50 ? input.substring(0, 50) : input;
      const quizQuestions = await generateGeminiQuiz('general', topicForQuiz, language);
      
      if (quizQuestions && quizQuestions.length > 0) {
        // Convert quiz questions to the format expected by frontend
        quiz = {
          id: Date.now().toString(),
          questions: quizQuestions.map((q, index) => ({
            id: `q${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correct,
            explanation: `This question tests your understanding of ${topicForQuiz}.`,
            difficulty: 'medium',
            points: 10
          })),
          topic: topicForQuiz,
          totalQuestions: quizQuestions.length
        };
      }
    } catch (quizError) {
      console.log('Quiz generation failed, continuing without quiz:', quizError);
    }
    
    console.log('Lingo text response:', text);
    res.json({ text, image, quiz });
  } catch (e) {
    console.error('Error in /ai-response:', e);
    res.status(500).json({ error: 'Failed to generate response', details: e.message });
  }
});

router.post('/generate-quiz', async (req, res) => {
  const { subject, topic, language } = req.body;
  try {
    const questions = await generateGeminiQuiz(subject, topic, language);
    
    // If no questions generated, provide fallback questions
    if (!questions || questions.length === 0) {
      console.log('No questions generated, using fallback questions');
      const fallbackQuestions = [
        {
          question: `What is the main topic of ${topic} in ${subject}?`,
          options: ['A fundamental concept', 'A complex theory', 'A simple fact', 'A basic principle'],
          correct: 0,
          type: 'mcq'
        },
        {
          question: `Is ${topic} important in ${subject}?`,
          options: ['True', 'False'],
          correct: 0,
          type: 'tf'
        },
        {
          question: `Which of the following best describes ${topic}?`,
          options: ['A scientific method', 'A mathematical concept', 'A historical event', 'A language rule'],
          correct: 0,
          type: 'mcq'
        }
      ];
      res.json({ questions: fallbackQuestions });
    } else {
      res.json({ questions });
    }
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz questions.' });
  }
});

export default router; 