import librosa
import numpy as np
from typing import Dict, List, Tuple
import re

class SpeechAnalyzer:
    """Analyzes speech recordings for cognitive performance metrics"""

    def __init__(self):
        self.filler_words = ['um', 'uh', 'like', 'you know', 'so', 'basically', 'actually']

    def analyze_audio(self, audio_path: str, transcript: str, duration: float) -> Dict:
        """
        Analyze audio file and transcript for speech metrics

        Args:
            audio_path: Path to audio file
            transcript: Transcribed text from Whisper
            duration: Duration in seconds

        Returns:
            Dictionary with speech metrics
        """
        try:
            # Load audio file
            y, sr = librosa.load(audio_path, sr=None)
            actual_duration = librosa.get_duration(y=y, sr=sr)

            # Analyze transcript
            words = self._extract_words(transcript)
            word_count = len(words)
            words_per_minute = (word_count / actual_duration) * 60 if actual_duration > 0 else 0

            # Count filler words
            filler_count = self._count_filler_words(transcript.lower())

            # Analyze pauses
            pause_metrics = self._analyze_pauses(y, sr)

            # Calculate speech rate variability
            speech_rate = self._calculate_speech_rate(y, sr, word_count)

            return {
                'word_count': word_count,
                'words_per_minute': round(words_per_minute, 2),
                'filler_word_count': filler_count,
                'filler_word_rate': round((filler_count / word_count * 100) if word_count > 0 else 0, 2),
                'average_pause_length': round(pause_metrics['avg_pause'], 3),
                'pause_count': pause_metrics['pause_count'],
                'speech_rate_variability': round(speech_rate, 2),
                'duration': round(actual_duration, 2)
            }
        except Exception as e:
            raise Exception(f"Error analyzing audio: {str(e)}")

    def _extract_words(self, text: str) -> List[str]:
        """Extract words from transcript"""
        # Remove punctuation and split
        words = re.findall(r'\b\w+\b', text.lower())
        return words

    def _count_filler_words(self, text: str) -> int:
        """Count filler words in transcript"""
        count = 0
        for filler in self.filler_words:
            count += text.count(filler)
        return count

    def _analyze_pauses(self, y: np.ndarray, sr: int) -> Dict:
        """Analyze pauses in speech"""
        # Calculate RMS energy
        rms = librosa.feature.rms(y=y)[0]

        # Define silence threshold (10% of max RMS)
        threshold = np.max(rms) * 0.1

        # Find silent regions
        is_silent = rms < threshold

        # Find pause durations
        pauses = []
        pause_start = None
        hop_length = 512

        for i, silent in enumerate(is_silent):
            if silent and pause_start is None:
                pause_start = i
            elif not silent and pause_start is not None:
                pause_duration = (i - pause_start) * hop_length / sr
                if pause_duration > 0.3:  # Only count pauses > 0.3 seconds
                    pauses.append(pause_duration)
                pause_start = None

        return {
            'avg_pause': np.mean(pauses) if pauses else 0.0,
            'pause_count': len(pauses),
            'max_pause': np.max(pauses) if pauses else 0.0
        }

    def _calculate_speech_rate(self, y: np.ndarray, sr: int, word_count: int) -> float:
        """Calculate speech rate variability"""
        # Segment audio into 1-second windows
        window_size = sr  # 1 second
        num_windows = len(y) // window_size

        if num_windows < 2:
            return 0.0

        # Calculate energy per window
        energies = []
        for i in range(num_windows):
            window = y[i * window_size:(i + 1) * window_size]
            energy = np.sqrt(np.mean(window ** 2))
            energies.append(energy)

        # Calculate coefficient of variation
        if np.mean(energies) > 0:
            cv = np.std(energies) / np.mean(energies)
            return cv
        return 0.0
