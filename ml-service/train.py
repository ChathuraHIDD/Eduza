import os
from dotenv import load_dotenv

import numpy as np
from pymongo import MongoClient
import certifi

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "eduza")
MODEL_PATH = os.getenv("MODEL_PATH", "models/task_duration_model.pkl")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set. Check ml-service/.env")

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


def build_rows(db, sessions_col="studysessions", logs_col="progresslogs"):
    """
    Builds training rows from:
      - sessions collection (completed stopwatch sessions)
      - progress logs collection (progress% snapshots)
    """

    # Load data
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

        # Milestone target (you can change later)
        target = 70.0
        current = p1
        delta = target - current
        if delta <= 0:
            continue

        # Label: estimated minutes to reach target (approx)
        y = pace * delta

        # placeholders until you store them in DB
        difficulty = 2.0     # 1 easy, 2 medium, 3 hard
        daily_hours = 3.0    # daily available hours

        X = [
            current,     # current_progress
            target,      # target_progress
            delta,       # delta_progress
            pace,        # past_study_pace
            difficulty,  # difficulty encoded
            daily_hours, # daily available hours
        ]

        rows_X.append(X)
        rows_y.append(y)

    return np.array(rows_X), np.array(rows_y)


def main():
    client = make_mongo_client(MONGO_URI)

    # Quick ping so you immediately know if connection is OK
    try:
        print("Mongo ping:", client.admin.command("ping"))
    except Exception as e:
        print("❌ Mongo connection failed.")
        print("Reason:", str(e))
        print("\n✅ Checklist:")
        print("- Atlas Network Access allows your IP (or 0.0.0.0/0 temporarily)")
        print("- Cluster is running (not paused)")
        print("- MONGO_URI includes /eduza and correct password")
        return

    db = client[DB_NAME]

    # Helpful: verify collections exist
    collections = db.list_collection_names()
    print("✅ Collections in DB:", collections)

    # Try to build dataset
    try:
        X, y = build_rows(db, sessions_col="studysessions", logs_col="progresslogs")
    except Exception as e:
        print("❌ Failed while reading collections.")
        print("Reason:", str(e))
        print("\nTip: Your collection names might be different.")
        print("Check the printed collection list above and update sessions_col/logs_col.")
        return

    if len(X) < 30:
        print(f"⚠️ Not enough training samples: {len(X)}")
        print("Use the app more to create completed sessions + progress logs.")
        print("Also confirm collections are exactly: 'studysessions' and 'progresslogs'.")
        return

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


if __name__ == "__main__":
    main()