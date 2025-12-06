import numpy as np
from typing import Dict, List

class VisualAnalyzer:
    """Analyzes eye tracking and visual-motor performance"""

    def analyze_eye_tracking(self, tracking_data: List[Dict]) -> Dict:
        """
        Analyze eye tracking data from smooth pursuit test

        Args:
            tracking_data: List of dicts with 'target_x', 'target_y', 'gaze_x', 'gaze_y', 'timestamp'

        Returns:
            Dictionary with visual-motor metrics
        """
        if not tracking_data or len(tracking_data) < 10:
            return {
                'tracking_accuracy': 0,
                'smooth_pursuit_gain': 0,
                'saccade_count': 0,
                'blink_count': 0,
                'average_error': 0
            }

        errors = []
        velocities = []
        blink_count = 0

        for i, point in enumerate(tracking_data):
            target_x = point.get('target_x', 0)
            target_y = point.get('target_y', 0)
            gaze_x = point.get('gaze_x', 0)
            gaze_y = point.get('gaze_y', 0)

            # Check for blinks (missing gaze data)
            if gaze_x == 0 and gaze_y == 0:
                blink_count += 1
                continue

            # Calculate tracking error
            error = np.sqrt((target_x - gaze_x)**2 + (target_y - gaze_y)**2)
            errors.append(error)

            # Calculate gaze velocity for saccade detection
            if i > 0:
                prev_point = tracking_data[i-1]
                dt = point.get('timestamp', 0) - prev_point.get('timestamp', 0)

                if dt > 0:
                    dx = gaze_x - prev_point.get('gaze_x', 0)
                    dy = gaze_y - prev_point.get('gaze_y', 0)
                    velocity = np.sqrt(dx**2 + dy**2) / dt
                    velocities.append(velocity)

        # Detect saccades (rapid eye movements)
        saccade_count = 0
        if velocities:
            velocity_threshold = np.mean(velocities) + 2 * np.std(velocities)
            saccade_count = sum(1 for v in velocities if v > velocity_threshold)

        # Calculate tracking accuracy
        avg_error = np.mean(errors) if errors else 0
        # Normalize to 0-100 (assuming screen size ~1000px, error <50px is good)
        tracking_accuracy = max(0, min(100, 100 - (avg_error / 50 * 100)))

        # Calculate smooth pursuit gain (how well gaze follows target)
        # Perfect tracking = 1.0, poor tracking < 0.8
        pursuit_gain = max(0, 1 - (avg_error / 100)) if avg_error > 0 else 1.0

        return {
            'tracking_accuracy': round(tracking_accuracy, 2),
            'smooth_pursuit_gain': round(pursuit_gain, 3),
            'saccade_count': saccade_count,
            'blink_count': blink_count,
            'average_error': round(avg_error, 2),
            'max_error': round(float(np.max(errors)), 2) if errors else 0,
            'tracking_stability': round(100 - min(100, np.std(errors) if errors else 0), 2)
        }

    def calculate_visual_score(self, tracking_metrics: Dict) -> float:
        """
        Calculate overall visual-motor performance score (0-100)

        Args:
            tracking_metrics: Eye tracking metrics

        Returns:
            Visual-motor score (0-100)
        """
        # Tracking accuracy (0-100)
        accuracy_score = tracking_metrics.get('tracking_accuracy', 0)

        # Smooth pursuit gain (0-1, convert to 0-100)
        gain_score = tracking_metrics.get('smooth_pursuit_gain', 0) * 100

        # Stability score
        stability_score = tracking_metrics.get('tracking_stability', 0)

        # Penalize excessive saccades (should be < 10 for smooth pursuit)
        saccade_count = tracking_metrics.get('saccade_count', 0)
        saccade_penalty = min(20, saccade_count * 2)

        # Weighted combination
        visual_score = (accuracy_score * 0.4 + gain_score * 0.3 + stability_score * 0.3) - saccade_penalty
        visual_score = max(0, min(100, visual_score))

        return round(visual_score, 2)
