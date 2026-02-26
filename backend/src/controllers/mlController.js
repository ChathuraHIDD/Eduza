const path = require("path");
const { spawn } = require("child_process");

const predictTaskDuration = async (req, res) => {
  try {
    const payload = req.body;

    // Path to python script (ml-service/predict.py)
    const scriptPath = path.join(__dirname, "../../../ml-service/predict.py");

    // Use python from venv if you want (recommended)
    const pythonPath = path.join(__dirname, "../../../ml-service/.venv/bin/python");

    const py = spawn(pythonPath, [scriptPath]);

    let result = "";
    let errText = "";

    py.stdout.on("data", (data) => (result += data.toString()));
    py.stderr.on("data", (data) => (errText += data.toString()));

    py.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          message: "ML prediction failed",
          error: errText || result,
        });
      }

      try {
        const json = JSON.parse(result);
        return res.json(json);
      } catch (e) {
        return res.status(500).json({
          message: "Invalid ML response",
          raw: result,
        });
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