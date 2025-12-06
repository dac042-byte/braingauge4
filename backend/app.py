from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import shutil
from datetime import datetime

from config import config
from models.speech_analysis import SpeechAnalyzer
from models.cognitive_analysis import CognitiveAnalyzer
from models.visual_analysis import VisualAnalyzer
from services.whisper_service import WhisperService
from services.drift_calculator import DriftCalculator

# Initialize FastAPI app
app = FastAPI(title="BrainGauge API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
speech_analyzer = SpeechAnalyzer()
cognitive_analyzer = CognitiveAnalyzer()
visual_analyzer = VisualAnalyzer()
drift_calculator = DriftCalculator(config.DATA_FOLDER)

# Ensure required directories exist
os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(config.DATA_FOLDER, exist_ok=True)

# Pydantic models for request/response
class CognitiveSubmission(BaseModel):
    user_id: str
    reaction_times: List[float]
    nback_responses: List[Dict]

class VisualSubmission(BaseModel):
    user_id: str
    tracking_data: List[Dict]

class ResetBaselineRequest(BaseModel):
    user_id: str

# Health check endpoint
@app.get("/")
async def root():
    return {
        "service": "BrainGauge API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Get speech passages
@app.get("/passages")
async def get_passages():
    """Get available speech assessment passages"""
    return {
        "passages": config.SPEECH_PASSAGES,
        "count": len(config.SPEECH_PASSAGES)
    }

# Audio upload and speech analysis
@app.post("/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    duration: float = Form(...)
):
    """
    Upload audio recording and perform speech analysis

    Args:
        file: Audio file (wav, m4a, mp3, etc.)
        user_id: Unique user identifier
        duration: Recording duration in seconds

    Returns:
        Speech metrics and drift score
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Save uploaded file
        file_path = os.path.join(config.UPLOAD_FOLDER, f"{user_id}_{datetime.now().timestamp()}.wav")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Initialize Whisper service
        try:
            whisper_service = WhisperService()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Transcribe audio
        try:
            transcript = whisper_service.transcribe_audio(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

        # Analyze speech
        try:
            speech_metrics = speech_analyzer.analyze_audio(file_path, transcript, duration)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Speech analysis failed: {str(e)}")

        # Calculate drift from baseline
        drift_result = drift_calculator.calculate_speech_drift(user_id, speech_metrics)

        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "success": True,
            "transcript": transcript,
            "metrics": speech_metrics,
            "drift_score": drift_result['drift_score'],
            "is_baseline": drift_result['is_baseline'],
            "component_scores": drift_result.get('component_scores'),
            "baseline_metrics": drift_result.get('baseline_metrics')
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Cognitive test submission
@app.post("/cognitive/submit")
async def submit_cognitive(submission: CognitiveSubmission):
    """
    Submit cognitive test results and calculate drift

    Args:
        submission: Cognitive test data (reaction times and n-back responses)

    Returns:
        Cognitive metrics and drift score
    """
    try:
        # Analyze reaction time
        rt_metrics = cognitive_analyzer.analyze_reaction_time(submission.reaction_times)

        # Analyze n-back test
        nback_metrics = cognitive_analyzer.analyze_nback(submission.nback_responses)

        # Calculate overall cognitive score
        cognitive_score = cognitive_analyzer.calculate_cognitive_score(rt_metrics, nback_metrics)

        # Calculate drift from baseline
        drift_result = drift_calculator.calculate_cognitive_drift(
            submission.user_id,
            cognitive_score,
            rt_metrics,
            nback_metrics
        )

        return {
            "success": True,
            "cognitive_score": cognitive_score,
            "rt_metrics": rt_metrics,
            "nback_metrics": nback_metrics,
            "drift_score": drift_result['drift_score'],
            "is_baseline": drift_result['is_baseline'],
            "baseline_score": drift_result.get('baseline_score'),
            "score_change": drift_result.get('score_change')
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing cognitive data: {str(e)}")

# Visual tracking submission
@app.post("/visual/submit")
async def submit_visual(submission: VisualSubmission):
    """
    Submit eye tracking data and calculate drift

    Args:
        submission: Eye tracking data from smooth pursuit test

    Returns:
        Visual-motor metrics and drift score
    """
    try:
        # Analyze eye tracking
        tracking_metrics = visual_analyzer.analyze_eye_tracking(submission.tracking_data)

        # Calculate visual-motor score
        visual_score = visual_analyzer.calculate_visual_score(tracking_metrics)

        # Calculate drift from baseline
        drift_result = drift_calculator.calculate_visual_drift(
            submission.user_id,
            visual_score,
            tracking_metrics
        )

        return {
            "success": True,
            "visual_score": visual_score,
            "tracking_metrics": tracking_metrics,
            "drift_score": drift_result['drift_score'],
            "is_baseline": drift_result['is_baseline'],
            "baseline_score": drift_result.get('baseline_score'),
            "score_change": drift_result.get('score_change')
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing visual data: {str(e)}")

# Get weekly neuro load score
@app.get("/score/weekly/{user_id}")
async def get_weekly_score(user_id: str):
    """
    Get the most recent weekly neuro load score

    Args:
        user_id: User identifier

    Returns:
        Latest neuro load score and component scores
    """
    try:
        history = drift_calculator.get_history(user_id, limit=1)

        if not history:
            return {
                "success": False,
                "message": "No assessments found. Complete your first assessment to see scores."
            }

        latest = history[0]

        return {
            "success": True,
            "week": latest['week'],
            "neuro_load_score": latest['neuro_load_score'],
            "is_baseline": latest['is_baseline'],
            "component_scores": {
                "speech": latest['speech']['drift_score'],
                "cognitive": latest['cognitive']['drift_score'],
                "visual": latest['visual']['drift_score']
            },
            "timestamp": latest['timestamp']
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving score: {str(e)}")

# Get assessment history
@app.get("/history/{user_id}")
async def get_history(user_id: str, limit: Optional[int] = None):
    """
    Get assessment history for user

    Args:
        user_id: User identifier
        limit: Optional limit on number of results

    Returns:
        List of historical assessments
    """
    try:
        history = drift_calculator.get_history(user_id, limit)

        return {
            "success": True,
            "count": len(history),
            "history": history
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

# Save complete assessment
@app.post("/assessment/save")
async def save_assessment(
    user_id: str = Form(...),
    speech_drift: float = Form(...),
    speech_metrics: str = Form(...),
    cognitive_drift: float = Form(...),
    cognitive_score: float = Form(...),
    rt_metrics: str = Form(...),
    nback_metrics: str = Form(...),
    visual_drift: float = Form(...),
    visual_score: float = Form(...),
    tracking_metrics: str = Form(...)
):
    """
    Save a complete weekly assessment

    Args:
        All assessment data from the three modules

    Returns:
        Saved assessment with neuro load score
    """
    try:
        import json

        # Parse JSON strings
        speech_metrics_dict = json.loads(speech_metrics)
        rt_metrics_dict = json.loads(rt_metrics)
        nback_metrics_dict = json.loads(nback_metrics)
        tracking_metrics_dict = json.loads(tracking_metrics)

        # Calculate neuro load score
        neuro_load_score = drift_calculator.calculate_neuro_load_score(
            speech_drift,
            cognitive_drift,
            visual_drift
        )

        # Prepare assessment data
        assessment_data = {
            'neuro_load_score': neuro_load_score,
            'speech': {
                'drift_score': speech_drift,
                'metrics': speech_metrics_dict
            },
            'cognitive': {
                'drift_score': cognitive_drift,
                'cognitive_score': cognitive_score,
                'rt_metrics': rt_metrics_dict,
                'nback_metrics': nback_metrics_dict
            },
            'visual': {
                'drift_score': visual_drift,
                'visual_score': visual_score,
                'tracking_metrics': tracking_metrics_dict
            }
        }

        # Save assessment
        result = drift_calculator.save_assessment(user_id, assessment_data)

        return {
            "success": True,
            "week": result['week'],
            "is_baseline": result['is_baseline'],
            "neuro_load_score": result['neuro_load_score'],
            "message": "Baseline established!" if result['is_baseline'] else f"Week {result['week']} assessment saved"
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving assessment: {str(e)}")

# Get insights
@app.get("/insights/{user_id}")
async def get_insights(user_id: str):
    """
    Get personalized insights based on assessment history

    Args:
        user_id: User identifier

    Returns:
        Insights and recommendations
    """
    try:
        insights = drift_calculator.get_insights(user_id)

        return {
            "success": True,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

# Reset baseline
@app.post("/baseline/reset")
async def reset_baseline(request: ResetBaselineRequest):
    """
    Reset user's baseline (clear all data)

    Args:
        request: User ID to reset

    Returns:
        Success confirmation
    """
    try:
        drift_calculator.reset_baseline(request.user_id)

        return {
            "success": True,
            "message": "Baseline reset successfully. Your next assessment will establish a new baseline."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting baseline: {str(e)}")

# Export data
@app.get("/export/{user_id}")
async def export_data(user_id: str):
    """
    Export all user data as JSON

    Args:
        user_id: User identifier

    Returns:
        Complete user data
    """
    try:
        history = drift_calculator.get_history(user_id)
        insights = drift_calculator.get_insights(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "export_date": datetime.now().isoformat(),
            "total_assessments": len(history),
            "history": history,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
