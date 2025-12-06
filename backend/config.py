import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    PORT = int(os.getenv('PORT', 8000))
    UPLOAD_FOLDER = 'uploads'
    DATA_FOLDER = 'data'
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

    # Assessment passages for speech analysis
    SPEECH_PASSAGES = [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for testing. Speaking clearly and naturally helps us measure your baseline cognitive performance.",
        "Athletes train their bodies every day, but cognitive fitness is just as important. Mental sharpness, quick reactions, and clear communication are essential for peak performance in any sport.",
        "Research shows that regular monitoring of cognitive function can help detect early signs of fatigue or stress. By tracking these metrics weekly, athletes can optimize their training and recovery."
    ]

    # Scoring weights
    SCORE_WEIGHTS = {
        'speech': 0.35,
        'cognitive': 0.40,
        'visual': 0.25
    }

config = Config()
