from flask import Flask, request, send_file, jsonify
import edge_tts
import uuid
import os
import asyncio
import threading
import time
import traceback

app = Flask(__name__)

audio_dir = os.path.join(os.path.dirname(__file__), 'tts_audio')
os.makedirs(audio_dir, exist_ok=True)

voice_map = {
    'en': 'en-IN-NeerjaNeural',
    'hi': 'hi-IN-SwaraNeural',
    'te': 'te-IN-MohanNeural',
    'ta': 'ta-IN-PallaviNeural',
    'bn': 'bn-IN-TanishaaNeural',
    'kn': 'kn-IN-SapnaNeural',
    'ml': 'ml-IN-SobhanaNeural',
    'gu': 'gu-IN-DhwaniNeural'
}

def delayed_delete(path, delay=5):
    def _delete():
        time.sleep(delay)
        try:
            os.remove(path)
        except Exception as e:
            app.logger.error(f"Error deleting file: {e}")
    threading.Thread(target=_delete, daemon=True).start()

@app.route('/speak', methods=['POST'])
def speak():
    try:
        print('Received request:', request.json)
        data = request.json
        if not data or 'text' not in data or ('lang' not in data and 'language' not in data):
            print('Missing text or lang/language in request')
            return jsonify({'error': 'Missing text or lang/language'}), 400

        text = data['text']
        lang = data.get('lang') or data.get('language')

        # Choose a voice based on language
        voice_map = {
            'en': 'en-US-AriaNeural',
            'hi': 'hi-IN-SwaraNeural',
            'te': 'te-IN-ShrutiNeural',
            # Add more as needed
        }
        voice = voice_map.get(lang, 'en-US-AriaNeural')

        # Generate a unique filename for each request
        audio_id = str(uuid.uuid4())
        audio_path = os.path.join(audio_dir, f'tts-{audio_id}.mp3')

        async def generate():
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(audio_path)

        asyncio.run(generate())

        return send_file(audio_path, mimetype='audio/mpeg')

    except Exception as e:
        print('TTS error:', e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5500)