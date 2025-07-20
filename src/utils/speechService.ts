const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchTTS(text: string, lang: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  });
  if (!response.ok) throw new Error('TTS generation failed');
  return await response.blob();
}