import os
import uuid
import time
import threading
import traceback
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import edge_tts
import asyncio

app = Flask(__name__)

# Allow CORS for production frontend (set TTS_ALLOWED_ORIGIN env var)
CORS(app, origins=os.environ.get('TTS_ALLOWED_ORIGIN', '*'))

audio_dir = os.path.join(os.path.dirname(__file__), 'tts_audio')
os.makedirs(audio_dir, exist_ok=True)

# Production-level voice map for supported languages
VOICE_MAP = {
    'en': 'en-IN-NeerjaNeural',
    'hi': 'hi-IN-SwaraNeural',
    'te': 'te-IN-MohanNeural',
    'ta': 'ta-IN-PallaviNeural',
    'bn': 'bn-IN-TanishaaNeural',
    'kn': 'kn-IN-SapnaNeural',
    'ml': 'ml-IN-SobhanaNeural',
    'gu': 'gu-IN-DhwaniNeural'
}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

def delayed_delete(path, delay=30):
    def _delete():
        time.sleep(delay)
        try:
            os.remove(path)
            app.logger.info(f"Deleted audio file: {path}")
        except Exception as e:
            app.logger.error(f"Error deleting file: {e}")
    threading.Thread(target=_delete, daemon=True).start()

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.json
        app.logger.info(f'Received TTS request: {data}')
        if not data or 'text' not in data or ('lang' not in data and 'language' not in data):
            app.logger.warning('Missing text or lang/language in request')
            return jsonify({'error': 'Missing text or lang/language'}), 400

        text = data['text']
        lang = data.get('lang') or data.get('language')
        voice = VOICE_MAP.get(lang, VOICE_MAP['en'])

        # Generate a unique filename for each request
        audio_id = str(uuid.uuid4())
        audio_path = os.path.join(audio_dir, f'tts-{audio_id}.mp3')

        async def generate():
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(audio_path)

        asyncio.run(generate())

        # Schedule file deletion after 30 seconds
        delayed_delete(audio_path, delay=30)

        # Serve audio as a download with proper headers
        return send_file(
            audio_path,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f'tts-{audio_id}.mp3'
        )

    except Exception as e:
        app.logger.error(f'TTS error: {e}')
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5500))
    app.run(host='0.0.0.0', port=port)