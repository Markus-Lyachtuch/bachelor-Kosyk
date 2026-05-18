import io
import gc
import os
import uuid
import base64
import tempfile
from pydub import AudioSegment
from phonemizer import phonemize
from flask import Blueprint, jsonify, request
from app.models.whisper import whisper_service
from app.models.wav2vec import recognize_with_wav2vec
from app.models.wav2vec import get_model_and_processor
from app.services.pronunciation_scorer import score_pronunciation

pronunciationv3_bp = Blueprint('pronunciationv3', __name__, url_prefix='/api/v3')

def check_sentence_pronunciation(temp_filename: str, target_word: str):
    abspath = os.path.abspath(temp_filename)

    result = whisper_service.get_model().transcribe(
        abspath, word_timestamps=True, language='en', initial_prompt=f"The sentence is: {target_word}"
    )

    full_audio = AudioSegment.from_wav(abspath)
    results = []
    
    temp_dir = tempfile.gettempdir()
    
    for segment in result['segments']:
        for word_info in segment['words']:
            word_text = word_info['word'].strip()
            start_time = max(0, word_info['start'] * 1000 - 80)
            end_time = min(len(full_audio), word_info['end'] * 1000 + 80)
            
            chunk = full_audio[start_time:end_time]
            
            silence = AudioSegment.silent(duration=300)
            chunk = silence + chunk + silence
            
            safe_word = "".join(c for c in word_text if c.isalnum())
            chunk_filename = os.path.join(temp_dir, f"temp_{safe_word}_{uuid.uuid4().hex[:6]}.wav")

            chunk.export(chunk_filename, format="wav")
            
            try:
                user_phonemes = recognize_with_wav2vec(chunk_filename)
                
                target_phonemes = phonemize(word_text, language='en-us', backend='espeak', strip=True)
                
                result_metrics = score_pronunciation(target_phonemes, user_phonemes)
                
                results.append({
                    "word": word_text,
                    "score": result_metrics['score'],
                    "user_ipa": user_phonemes,
                    "target_ipa": target_phonemes,
                    "is_correct": result_metrics['is_correct'],
                    "feedback": "Excellent!" if result_metrics['is_correct'] else "Try again, focus on pronunciation."
                })
            finally:
                if os.path.exists(chunk_filename):
                    os.remove(chunk_filename)
            
    return jsonify({ "feedback": results })

@pronunciationv3_bp.route('/warmup', methods=['GET', 'POST'])
def handle_warmup():
    """endpoint for lambda"""
    print("Warmup triggered! Loading models into RAM...")

    try:
        get_model_and_processor('en')  
        whisper_service.load_whisper_model()
        gc.collect()
        return jsonify({"status": "Warmed up", "models": "ready"}), 200

    except Exception as e:
        print(f"Warmup failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@pronunciationv3_bp.route('/check_pronunciation', methods=['POST'])
def check_pronunciation():
    json_data = request.get_json(silent=True) or {}
    if 'audio' in request.files:
        audio_file = request.files['audio']
    
    elif 'audio_base64' in json_data:
        b64_data = json_data['audio_base64']
        audio_bytes = base64.b64decode(b64_data)
        audio_file = io.BytesIO(audio_bytes)
        audio_file.filename = "audio.wav"
    
    else:
        return jsonify({"error": "No audio"}), 400

    target_word = request.form.get('target_word') or json_data.get('target_word')
    if not target_word:
        return jsonify({"error": "Missing target_word"})
    
    target_ipa_raw = request.form.get('target_ipa') or json_data.get('target_ipa')
    if len(target_word.split(' ')) == 1 and not target_ipa_raw:
        return jsonify({"error": "Missing target_ipa"}), 400

    # lang_id = request.form.get('lang_id', 'en')

    # audio_file = request.files['audio']
    temp_dir = tempfile.gettempdir()
    filename = f"{uuid.uuid4()}.wav"
    temp_path = os.path.join(temp_dir, filename)

    try:
        # audio_file.save(temp_path)

        if isinstance(audio_file, io.BytesIO):
            with open(temp_path, "wb") as f:
                f.write(audio_file.getvalue())

        else:
            audio_file.save(temp_path)

        count_words = len(target_word.split(' '))

        if count_words > 1:
            return check_sentence_pronunciation(temp_path, target_word)

        recognized_ipa_raw = recognize_with_wav2vec(temp_path) # lang_id
        result_metrics = score_pronunciation(target_ipa_raw, recognized_ipa_raw)

        return jsonify({"feedback": [{
            "word": target_word,
            "is_correct": result_metrics['is_correct'],
            "score": result_metrics['score'],
            "distance": result_metrics['distance'],
            "recognized_raw": recognized_ipa_raw,
            "recognized_simple": result_metrics['recognized_simple'],
            "target_simple": result_metrics['target_simple'],
            "feedback": "Excellent!" if result_metrics['is_correct'] else "Try again, focus on pronunciation."
        }]})

    except Exception as e:
        print(f"Error processing audio: {e}")
        return jsonify({"error": str(e)}), 500
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
