const path = require("path");
const { spawn } = require("child_process");

function resolvePythonPath() {
  const venvPython = path.join(__dirname, "../../../ml-service/.venv/bin/python");
  if (require("fs").existsSync(venvPython)) return venvPython;
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  return "python3";
}

const predictTaskDuration = async (req, res) => {
  try {
    const payload = req.body;

    // Path to python script (ml-service/predict.py)
    const scriptPath = path.join(__dirname, "../../../ml-service/predict.py");

    // Prefer project venv, then env override, then python3 from PATH.
    const pythonPath = resolvePythonPath();

    const py = spawn(pythonPath, [scriptPath]);

    let result = "";
    let errText = "";
    let settled = false;

    const sendError = (message, error) => {
      if (settled) return;
      settled = true;
      return res.status(500).json({ message, error });
    };

    const sendSuccess = (data) => {
      if (settled) return;
      settled = true;
      return res.json(data);
    };

    py.stdout.on("data", (data) => (result += data.toString()));
    py.stderr.on("data", (data) => (errText += data.toString()));

    py.on("error", (err) => {
      return sendError("ML prediction failed", err?.message || "Python process failed to start");
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return sendError("ML prediction failed", errText || result || `Process exited with code ${code}`);
      }

      try {
        const json = JSON.parse(result);
        return sendSuccess(json);
      } catch (e) {
        return sendError("Invalid ML response", result || e.message);
      }
    });

    // send request body to python
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { predictTaskDuration };