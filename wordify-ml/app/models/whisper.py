import whisper

class WhisperModel:
    def __init__(self):
        self.model = None

    def load_whisper_model(self, model_name: str = 'small'):
        if self.model is None:
            self.model = whisper.load_model(model_name, download_root="/app/models")
            
    def transcribe(self, audio_path: str) -> dict:
        if self.model is None:
            self.load_whisper_model()
        result = self.model.transcribe(audio_path, language="en")

        return {
            "text": result.get("text", "").strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", "en")
        }

    def get_model(self):
        if self.model is None:
            self.load_whisper_model()
        return self.model

whisper_service = WhisperModel()
