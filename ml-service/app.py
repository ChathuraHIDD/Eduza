import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/task_duration_model.pkl")

app = FastAPI(title="EDUZA Task Duration Predictor")

model = None

class PredictRequest(BaseModel):
    current_progress: float
    target_progress: float
    past_study_pace: float        # minutes per 1% progress
    difficulty: float = 2.0       # 1 easy, 2 medium, 3 hard
    daily_available_hours: float = 3.0

@app.get("/health")
def health():
    return {"status": "OK", "model_loaded": model is not None}

@app.post("/load-model")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        return {"loaded": False, "message": "Model file not found. Train first."}
    model = joblib.load(MODEL_PATH)
    return {"loaded": True}

@app.post("/predict")
def predict(req: PredictRequest):
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        else:
            # fallback formula if no model yet
            delta = req.target_progress - req.current_progress
            if delta < 0:
                delta = 0
            return {"predicted_minutes": float(delta * req.past_study_pace), "fallback": True}

    delta = req.target_progress - req.current_progress
    if delta < 0:
        delta = 0

    X = np.array([[
        req.current_progress,
        req.target_progress,
        delta,
        req.past_study_pace,
        req.difficulty,
        req.daily_available_hours
    ]])

    pred = model.predict(X)[0]
    return {"predicted_minutes": float(max(0.0, pred)), "fallback": False}