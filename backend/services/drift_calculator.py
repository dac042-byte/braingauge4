import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from config import config

class DriftCalculator:
    """Calculates drift scores and manages baseline data"""

    def __init__(self, data_folder: str = 'data'):
        self.data_folder = data_folder
        os.makedirs(data_folder, exist_ok=True)

    def _get_user_file(self, user_id: str) -> str:
        """Get path to user's data file"""
        return os.path.join(self.data_folder, f'{user_id}.json')

    def _load_user_data(self, user_id: str) -> Dict:
        """Load user data from file"""
        file_path = self._get_user_file(user_id)
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        return {'baseline': None, 'history': []}

    def _save_user_data(self, user_id: str, data: Dict):
        """Save user data to file"""
        file_path = self._get_user_file(user_id)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

    def calculate_speech_drift(self, user_id: str, current_metrics: Dict) -> Dict:
        """Calculate drift from baseline for speech metrics"""
        user_data = self._load_user_data(user_id)
        baseline = user_data.get('baseline', {}).get('speech')

        if not baseline:
            # First assessment - this becomes the baseline
            return {
                'drift_score': 100,
                'is_baseline': True,
                'metrics': current_metrics
            }

        # Calculate drift for each metric
        drifts = []

        # Words per minute drift (within ±20% is good)
        wpm_drift = abs(current_metrics['words_per_minute'] - baseline['words_per_minute'])
        wpm_percent = (wpm_drift / baseline['words_per_minute']) * 100 if baseline['words_per_minute'] > 0 else 0
        wpm_score = max(0, 100 - (wpm_percent * 2.5))  # 20% drift = 50 points off
        drifts.append(wpm_score)

        # Filler word rate drift (increase is bad)
        filler_drift = current_metrics['filler_word_rate'] - baseline['filler_word_rate']
        filler_score = max(0, 100 - (filler_drift * 10))  # Each 1% increase = 10 points off
        drifts.append(filler_score)

        # Pause length drift (longer pauses are concerning)
        pause_drift = current_metrics['average_pause_length'] - baseline['average_pause_length']
        pause_score = max(0, 100 - (pause_drift * 50))  # Each 0.1s increase = 5 points off
        drifts.append(pause_score)

        # Speech rate variability drift
        variability_drift = abs(current_metrics['speech_rate_variability'] - baseline['speech_rate_variability'])
        variability_score = max(0, 100 - (variability_drift * 100))
        drifts.append(variability_score)

        # Overall drift score (lower = more drift from baseline)
        drift_score = sum(drifts) / len(drifts)

        return {
            'drift_score': round(drift_score, 2),
            'is_baseline': False,
            'metrics': current_metrics,
            'baseline_metrics': baseline,
            'component_scores': {
                'wpm': round(wpm_score, 2),
                'filler': round(filler_score, 2),
                'pause': round(pause_score, 2),
                'variability': round(variability_score, 2)
            }
        }

    def calculate_cognitive_drift(self, user_id: str, current_score: float, rt_metrics: Dict, nback_metrics: Dict) -> Dict:
        """Calculate drift from baseline for cognitive metrics"""
        user_data = self._load_user_data(user_id)
        baseline = user_data.get('baseline', {}).get('cognitive')

        if not baseline:
            return {
                'drift_score': 100,
                'is_baseline': True,
                'cognitive_score': current_score,
                'rt_metrics': rt_metrics,
                'nback_metrics': nback_metrics
            }

        # Calculate drift based on performance decline
        baseline_score = baseline.get('cognitive_score', 100)
        score_change = current_score - baseline_score

        # Drift score: 100 = no drift, lower = more drift
        # Performance decline of 10 points = 50 drift score
        drift_score = max(0, 100 + (score_change * 5))

        return {
            'drift_score': round(drift_score, 2),
            'is_baseline': False,
            'cognitive_score': current_score,
            'rt_metrics': rt_metrics,
            'nback_metrics': nback_metrics,
            'baseline_score': baseline_score,
            'score_change': round(score_change, 2)
        }

    def calculate_visual_drift(self, user_id: str, current_score: float, tracking_metrics: Dict) -> Dict:
        """Calculate drift from baseline for visual-motor metrics"""
        user_data = self._load_user_data(user_id)
        baseline = user_data.get('baseline', {}).get('visual')

        if not baseline:
            return {
                'drift_score': 100,
                'is_baseline': True,
                'visual_score': current_score,
                'tracking_metrics': tracking_metrics
            }

        baseline_score = baseline.get('visual_score', 100)
        score_change = current_score - baseline_score

        # Similar calculation to cognitive drift
        drift_score = max(0, 100 + (score_change * 5))

        return {
            'drift_score': round(drift_score, 2),
            'is_baseline': False,
            'visual_score': current_score,
            'tracking_metrics': tracking_metrics,
            'baseline_score': baseline_score,
            'score_change': round(score_change, 2)
        }

    def calculate_neuro_load_score(self, speech_drift: float, cognitive_drift: float, visual_drift: float) -> float:
        """
        Calculate overall Neuro Load Score from component drifts

        Args:
            speech_drift: Speech drift score (0-100)
            cognitive_drift: Cognitive drift score (0-100)
            visual_drift: Visual-motor drift score (0-100)

        Returns:
            Weighted average neuro load score (0-100)
        """
        weights = config.SCORE_WEIGHTS
        neuro_load = (
            speech_drift * weights['speech'] +
            cognitive_drift * weights['cognitive'] +
            visual_drift * weights['visual']
        )
        return round(neuro_load, 2)

    def save_assessment(self, user_id: str, assessment_data: Dict) -> Dict:
        """
        Save assessment and update baseline if needed

        Args:
            user_id: User identifier
            assessment_data: Complete assessment data with all scores

        Returns:
            Updated assessment with week number and baseline status
        """
        user_data = self._load_user_data(user_id)

        # Determine if this is the first assessment (baseline)
        is_first = user_data['baseline'] is None
        week_number = len(user_data['history']) + 1

        # Add metadata
        assessment_data['week'] = week_number
        assessment_data['timestamp'] = datetime.now().isoformat()
        assessment_data['is_baseline'] = is_first

        # Save to history
        user_data['history'].append(assessment_data)

        # Set baseline on first assessment
        if is_first:
            user_data['baseline'] = {
                'speech': assessment_data['speech']['metrics'],
                'cognitive': {
                    'cognitive_score': assessment_data['cognitive']['cognitive_score'],
                    'rt_metrics': assessment_data['cognitive']['rt_metrics'],
                    'nback_metrics': assessment_data['cognitive']['nback_metrics']
                },
                'visual': {
                    'visual_score': assessment_data['visual']['visual_score'],
                    'tracking_metrics': assessment_data['visual']['tracking_metrics']
                }
            }

        self._save_user_data(user_id, user_data)

        return {
            'week': week_number,
            'is_baseline': is_first,
            'neuro_load_score': assessment_data['neuro_load_score'],
            'assessment': assessment_data
        }

    def get_history(self, user_id: str, limit: Optional[int] = None) -> List[Dict]:
        """Get assessment history for user"""
        user_data = self._load_user_data(user_id)
        history = user_data['history']

        if limit:
            history = history[-limit:]

        return history

    def reset_baseline(self, user_id: str) -> bool:
        """Reset user's baseline (clear all data)"""
        file_path = self._get_user_file(user_id)
        if os.path.exists(file_path):
            os.remove(file_path)
        return True

    def get_insights(self, user_id: str) -> Dict:
        """Generate insights from assessment history"""
        history = self.get_history(user_id)

        if len(history) < 2:
            return {
                'message': 'Complete more assessments to see insights',
                'assessments_completed': len(history)
            }

        # Get latest assessment
        latest = history[-1]

        # Find area with most drift
        drifts = {
            'speech': latest['speech']['drift_score'],
            'cognitive': latest['cognitive']['drift_score'],
            'visual': latest['visual']['drift_score']
        }

        lowest_area = min(drifts, key=drifts.get)
        lowest_score = drifts[lowest_area]

        # Calculate trend (last 4 weeks)
        recent = history[-4:]
        neuro_scores = [a['neuro_load_score'] for a in recent]

        if len(neuro_scores) >= 2:
            trend_direction = 'improving' if neuro_scores[-1] > neuro_scores[0] else 'declining'
            trend_change = abs(neuro_scores[-1] - neuro_scores[0])
        else:
            trend_direction = 'stable'
            trend_change = 0

        return {
            'assessments_completed': len(history),
            'current_neuro_load': latest['neuro_load_score'],
            'area_of_concern': lowest_area if lowest_score < 80 else None,
            'concern_score': lowest_score,
            'trend': trend_direction,
            'trend_change': round(trend_change, 2),
            'component_scores': drifts
        }
