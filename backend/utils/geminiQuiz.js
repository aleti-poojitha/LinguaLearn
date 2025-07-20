import fetch from 'node-fetch';

export async function generateGeminiQuiz(subject, topic, language) {
  const prompt = `Generate 5 quiz questions (mix of MCQ and true/false) for a ${language} student about the topic '${topic}' in the subject '${subject}'.\nReturn the questions as a JSON array in this format:\n[{ "question": "...", "options": ["...", "...", ...], "correct": 0, "type": "mcq" }, ...]\nFor true/false, use options ["True", "False"] and correct as 0 or 1.`;

  console.log('Generating quiz for:', { subject, topic, language });
  console.log('Using prompt:', prompt);

  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();
  console.log('Full Gemini API response:', JSON.stringify(data, null, 2));
  
  let questions = [];
  try {
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || data.candidates?.[0]?.content?.text || '';
    console.log('Gemini raw response:', text);
    
    if (!text) {
      console.log('No text content in Gemini response');
      return [];
    }
    
    // Remove code block markers and trim
    text = text.replace(/```json|```/g, '').trim();
    console.log('Cleaned text:', text);
    
    // Extract the first JSON array in the text
    const match = text.match(/\[.*\]/s);
    if (match) {
      questions = JSON.parse(match[0]);
      console.log('Parsed questions:', questions);
    } else {
      console.log('No JSON array found in response');
    }
  } catch (e) {
    console.error('Error parsing quiz questions:', e);
    questions = [];
  }
  
  console.log('Final questions array:', questions);
  return questions;
} 