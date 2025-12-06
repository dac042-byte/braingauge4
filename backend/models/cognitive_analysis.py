import numpy as np
from typing import Dict, List

class CognitiveAnalyzer:
    """Analyzes cognitive test results"""

    def analyze_reaction_time(self, reaction_times: List[float]) -> Dict:
        """
        Analyze reaction time test results

        Args:
            reaction_times: List of reaction times in milliseconds

        Returns:
            Dictionary with reaction time metrics
        """
        if not reaction_times:
            return {
                'average_rt': 0,
                'median_rt': 0,
                'std_rt': 0,
                'fastest_rt': 0,
                'slowest_rt': 0
            }

        rt_array = np.array(reaction_times)

        # Remove outliers (> 3 standard deviations)
        mean_rt = np.mean(rt_array)
        std_rt = np.std(rt_array)
        filtered_rt = rt_array[np.abs(rt_array - mean_rt) <= 3 * std_rt]

        if len(filtered_rt) == 0:
            filtered_rt = rt_array

        return {
            'average_rt': round(float(np.mean(filtered_rt)), 2),
            'median_rt': round(float(np.median(filtered_rt)), 2),
            'std_rt': round(float(np.std(filtered_rt)), 2),
            'fastest_rt': round(float(np.min(filtered_rt)), 2),
            'slowest_rt': round(float(np.max(filtered_rt)), 2),
            'consistency_score': round(100 - min((np.std(filtered_rt) / np.mean(filtered_rt) * 100), 100), 2)
        }

    def analyze_nback(self, responses: List[Dict]) -> Dict:
        """
        Analyze 2-back working memory test results

        Args:
            responses: List of dicts with 'is_match', 'user_responded', 'correct'

        Returns:
            Dictionary with n-back metrics
        """
        if not responses:
            return {
                'accuracy': 0,
                'hits': 0,
                'misses': 0,
                'false_alarms': 0,
                'correct_rejections': 0,
                'response_time': 0
            }

        hits = 0
        misses = 0
        false_alarms = 0
        correct_rejections = 0
        response_times = []

        for response in responses:
            is_match = response.get('is_match', False)
            user_responded = response.get('user_responded', False)
            rt = response.get('response_time', 0)

            if rt > 0:
                response_times.append(rt)

            if is_match and user_responded:
                hits += 1
            elif is_match and not user_responded:
                misses += 1
            elif not is_match and user_responded:
                false_alarms += 1
            elif not is_match and not user_responded:
                correct_rejections += 1

        total = len(responses)
        correct = hits + correct_rejections
        accuracy = (correct / total * 100) if total > 0 else 0

        # Calculate d-prime (sensitivity index)
        hit_rate = hits / (hits + misses) if (hits + misses) > 0 else 0
        fa_rate = false_alarms / (false_alarms + correct_rejections) if (false_alarms + correct_rejections) > 0 else 0

        # Avoid extreme values for z-score calculation
        hit_rate = max(0.01, min(0.99, hit_rate))
        fa_rate = max(0.01, min(0.99, fa_rate))

        from scipy import stats
        d_prime = stats.norm.ppf(hit_rate) - stats.norm.ppf(fa_rate)

        avg_rt = np.mean(response_times) if response_times else 0

        return {
            'accuracy': round(accuracy, 2),
            'hits': hits,
            'misses': misses,
            'false_alarms': false_alarms,
            'correct_rejections': correct_rejections,
            'total_trials': total,
            'd_prime': round(float(d_prime), 3),
            'average_response_time': round(avg_rt, 2)
        }

    def calculate_cognitive_score(self, rt_metrics: Dict, nback_metrics: Dict) -> float:
        """
        Calculate overall cognitive performance score (0-100)

        Args:
            rt_metrics: Reaction time metrics
            nback_metrics: N-back metrics

        Returns:
            Cognitive score (0-100)
        """
        # Normalize reaction time (lower is better)
        # Typical RT: 200-400ms, excellent: <250ms, poor: >500ms
        rt_score = max(0, min(100, 100 - (rt_metrics.get('average_rt', 300) - 200) / 3))

        # Normalize accuracy (higher is better)
        accuracy_score = nback_metrics.get('accuracy', 0)

        # Normalize d-prime (higher is better, typical range 0-4)
        d_prime_score = min(100, nback_metrics.get('d_prime', 0) * 25)

        # Weighted combination
        cognitive_score = (rt_score * 0.3 + accuracy_score * 0.4 + d_prime_score * 0.3)

        return round(cognitive_score, 2)
