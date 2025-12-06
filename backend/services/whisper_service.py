from openai import OpenAI
from config import config
import os

class WhisperService:
    """Service for speech-to-text using OpenAI Whisper API"""

    def __init__(self):
        if not config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not set in environment variables")
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file using Whisper API

        Args:
            audio_file_path: Path to audio file

        Returns:
            Transcribed text
        """
        try:
            with open(audio_file_path, 'rb') as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            return transcript
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")
