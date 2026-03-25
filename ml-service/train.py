import os
from dotenv import load_dotenv

import numpy as np
import pandas as pd
from pymongo import MongoClient
import certifi

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")  # can be None; we will fallback to CSV
DB_NAME = os.getenv("DB_NAME", "eduza")
MODEL_PATH = os.getenv("MODEL_PATH", "models/task_duration_model.pkl")

# CSV fallback (Kaggle transformed)
CSV_PATH = os.getenv("CSV_PATH", "data/eduza_task_duration_training_ready.csv")

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)


def safe_float(x, default=None):
    try:
        if x is None:
            return default
        return float(x)
    except Exception:
        return default


def make_mongo_client(uri: str) -> MongoClient:
    """
    MongoDB Atlas (mongodb+srv://) connection with TLS CA bundle.
    """
    return MongoClient(
        uri,
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        socketTimeoutMS=15000,
        tls=True,
        tlsCAFile=certifi.where(),
    )


def build_rows_from_mongo(db, sessions_col="studysessions", logs_col="progresslogs"):
    """
    Builds training rows from Mongo:
      - sessions collection (stopwatch sessions)
      - progress logs collection (progress% snapshots)
    """
    sessions = list(db[sessions_col].find({}).sort("startTime", 1))
    logs = list(db[logs_col].find({}).sort("recordedAt", 1))

    # group logs by (user, moduleName)
    logs_by_key = {}
    for l in logs:
        key = (l.get("user"), l.get("moduleName"))
        logs_by_key.setdefault(key, []).append(l)

    rows_X = []
    rows_y = []

    for s in sessions:
        user = s.get("user")
        module = s.get("moduleName")
        dur_min = safe_float(s.get("durationMinutes"), None)

        if not user or not module or dur_min is None:
            continue

        key = (user, module)
        if key not in logs_by_key:
            continue

        end_time = s.get("endTime") or s.get("updatedAt")
        start_time = s.get("startTime")
        if not start_time or not end_time:
            continue

        logs_list = logs_by_key[key]

        before = None
        after = None

        for lg in logs_list:
            t = lg.get("recordedAt") or lg.get("createdAt")
            if not t:
                continue
            if t <= start_time:
                before = lg
            if t >= end_time and after is None:
                after = lg
                break

        if before is None or after is None:
            continue

        p0 = safe_float(before.get("progressPercent"), None)
        p1 = safe_float(after.get("progressPercent"), None)
        if p0 is None or p1 is None:
            continue

        progress_gain = p1 - p0
        if progress_gain <= 0:
            continue

        pace = dur_min / progress_gain  # minutes per 1% progress

        # milestone target for Mongo training
        target = 70.0
        current = p1
        delta = target - current
        if delta <= 0:
            continue

        # label = estimated minutes to reach target
        y = pace * delta

        difficulty = 2.0
        daily_hours = 3.0

        X = [
            current,
            target,
            delta,
            pace,
            difficulty,
            daily_hours,
        ]

        rows_X.append(X)
        rows_y.append(y)

    return np.array(rows_X), np.array(rows_y)


def load_rows_from_csv(csv_path: str):
    """
    Loads Kaggle-transformed training-ready CSV.
    Must include columns:
      current_progress, target_progress, delta_progress, past_study_pace,
      difficulty, daily_hours, minutes_needed
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    needed_cols = [
        "current_progress",
        "target_progress",
        "delta_progress",
        "past_study_pace",
        "difficulty",
        "daily_hours",
        "minutes_needed",
    ]

    missing = [c for c in needed_cols if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing columns: {missing}")

    df = df.dropna(subset=needed_cols)

    X = df[
        [
            "current_progress",
            "target_progress",
            "delta_progress",
            "past_study_pace",
            "difficulty",
            "daily_hours",
        ]
    ].values

    y = df["minutes_needed"].values

    return X, y


def train_and_save(X, y):
    if len(X) < 30:
        print(f"❌ Not enough training samples: {len(X)} (need at least 30)")
        return

    print("✅ Training samples:", len(X))

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        max_depth=None,
        min_samples_split=2,
    )

    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print("✅ R^2 on test:", round(score, 4))

    joblib.dump(model, MODEL_PATH)
    print("✅ Saved model to:", MODEL_PATH)


def main():
    X = None
    y = None

    # ---------- Try Mongo first ----------
    if MONGO_URI:
        try:
            client = make_mongo_client(MONGO_URI)
            print("Mongo ping:", client.admin.command("ping"))

            db = client[DB_NAME]
            print("✅ Collections in DB:", db.list_collection_names())

            X_m, y_m = build_rows_from_mongo(db)

            if X_m is not None and len(X_m) >= 30:
                print("✅ Using MongoDB data for training.")
                X, y = X_m, y_m
            else:
                print(f"⚠ Mongo samples not enough: {0 if X_m is None else len(X_m)}")
                print("➡ Switching to CSV dataset...")

        except Exception as e:
            print("⚠ Mongo failed, switching to CSV.")
            print("Reason:", str(e))

    else:
        print("⚠ MONGO_URI not set, using CSV dataset...")

    # ---------- Fallback to CSV ----------
    if X is None or len(X) < 30:
        try:
            X, y = load_rows_from_csv(CSV_PATH)
            print(f"✅ Loaded CSV dataset: {CSV_PATH}")
        except Exception as e:
            print("❌ CSV loading failed.")
            print("Reason:", str(e))
            return

    # ---------- Train ----------
    train_and_save(X, y)


if __name__ == "__main__":
    main()