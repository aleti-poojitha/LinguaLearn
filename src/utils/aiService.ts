import { Subject, Language, AIResponse } from '../types';

export const getAIResponse = async (
  input: string,
  subject: Subject,
  language: Language,
  context?: { previousMessages?: string[]; userLevel?: number }
): Promise<AIResponse> => {
  const response = await fetch('http://localhost:5000/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input, subject, language })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data: AIResponse = await response.json();
  return data;
};

export async function fetchTTS(text: string, lang: string) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });
    if (!res.ok) throw new Error('TTS failed');
    return await res.blob();
  } catch (err) {
    alert('Sorry, text-to-speech is currently unavailable. Please try again later.');
    throw err;
  }
}
