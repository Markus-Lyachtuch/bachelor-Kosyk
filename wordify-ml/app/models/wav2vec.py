import torch
import librosa
import platform
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from phonemizer.backend.espeak.wrapper import EspeakWrapper

system_os = platform.system()
if system_os == 'Windows':
    _ESPEAK_LIBRARY = 'C:/Program Files/eSpeak NG/libespeak-ng.dll'
    EspeakWrapper.set_library(_ESPEAK_LIBRARY)
    
elif system_os == 'Linux':
    pass

else:
    print(f"Warning: Unknown OS {system_os}, espeak might fail.")

MODELS_CONFIG = {
    'en': "facebook/wav2vec2-lv-60-espeak-cv-ft"
}

loaded_models = {}

def get_model_and_processor(lang_id='en'):
    """first init load model"""
    if lang_id not in MODELS_CONFIG:
        print(f"Language {lang_id} not supported, falling back to 'en'")
        lang_id = 'en'
    
    if lang_id not in loaded_models:
        print(f"Loading Wav2Vec2 model for '{lang_id}'...")
        model_name = MODELS_CONFIG[lang_id]
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name)
        loaded_models[lang_id] = (model, processor)
        print(f"Model for '{lang_id}' loaded successfully!")
    
    return loaded_models[lang_id]

def recognize_with_wav2vec(audio_path):
    """audio to phonemes"""
    
    model, processor = get_model_and_processor()
    speech, _ = librosa.load(audio_path, sr=16000)
    
    input_values = processor(speech, return_tensors="pt", sampling_rate=16000).input_values
    
    with torch.no_grad():
        logits = model(input_values).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)
    
    return transcription[0]
