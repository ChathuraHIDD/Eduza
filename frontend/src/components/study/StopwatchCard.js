import { useEffect, useMemo, useRef, useState } from "react";
import { startStudySession, stopStudySession } from "../../utils/studySessionApi";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Props:
 * - userId (string) REQUIRED
 * - moduleName (string) REQUIRED
 * - sessionType ("learn"|"revision"|"assessment") optional
 * - onStopped(optional): callback(sessionResponse)
 *
 * Optional (if you later connect to study plan modules):
 * - studyPlanId
 * - moduleId
 */
export default function StopwatchCard({
  userId,
  moduleName,
  sessionType = "learn",
  studyPlanId = null,
  moduleId = null,
  onStopped,
}) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [progressPercent, setProgressPercent] = useState(""); // user can type on stop
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tickRef = useRef(null);
  const startedAtRef = useRef(null);

  const canStart = useMemo(() => !!userId && !!moduleName, [userId, moduleName]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  const handleStart = async () => {
    setError("");
    if (!canStart) {
      setError("userId and moduleName are required.");
      return;
    }

    setLoading(true);
    try {
      const session = await startStudySession({
        user: userId,
        moduleName,
        sessionType,
        studyPlanId,
        moduleId,
      });

      setSessionId(session._id);
      setSeconds(0);
      startedAtRef.current = Date.now();
      setRunning(true);
    } catch (e) {
      setError(e.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setError("");
    if (!sessionId) {
      setError("No active session to stop.");
      return;
    }

    setLoading(true);
    try {
      const p =
        progressPercent === ""
          ? undefined
          : Math.max(0, Math.min(100, Number(progressPercent)));

      const stopped = await stopStudySession(sessionId, {
        progressPercent: p,
        createProgressLog: p !== undefined, // only if user entered progress
      });

      setRunning(false);
      clearInterval(tickRef.current);
      setSessionId(null);
      startedAtRef.current = null;

      if (onStopped) onStopped(stopped);
    } catch (e) {
      setError(e.message || "Failed to stop session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        padding: "1rem",
        color: "#f0f0f0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
            Stopwatch Session
          </div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{moduleName}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            Mode: <span style={{ color: "#f97316" }}>{sessionType}</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            {formatTime(seconds)}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {running ? "Running..." : "Stopped"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {!running ? (
          <button
            onClick={handleStart}
            disabled={loading || !canStart}
            style={{
              background: "#f97316",
              border: "none",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: loading || !canStart ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Starting..." : "Start"}
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            style={{
              background: "#ef4444",
              border: "none",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Stopping..." : "Stop"}
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>
            Progress % (optional on stop)
          </label>
          <input
            value={progressPercent}
            onChange={(e) => setProgressPercent(e.target.value)}
            placeholder="e.g. 45"
            style={{
              width: 90,
              background: "#0f0f0f",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "8px 10px",
              color: "#f0f0f0",
            }}
          />
        </div>
      </div>

      {sessionId && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#666" }}>
          Active Session ID: {sessionId}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>
          {error}
        </div>
      )}
    </div>
  );
}