import json
import os
import sys
import joblib
import numpy as np
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "task_duration_model.pkl")

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)

        current_progress = float(payload["current_progress"])
        target_progress = float(payload.get("target_progress", 100))
        delta_progress = float(payload.get("delta_progress", target_progress - current_progress))
        past_study_pace = float(payload["past_study_pace"])
        difficulty = float(payload.get("difficulty", 2))
        daily_hours = float(payload.get("daily_hours", 3))

        X = np.array([[current_progress, target_progress, delta_progress, past_study_pace, difficulty, daily_hours]])

        model = joblib.load(MODEL_PATH)
        pred = float(model.predict(X)[0])

        print(json.dumps({"predicted_minutes": round(pred, 2)}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()