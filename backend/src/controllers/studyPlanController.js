const StudyPlan = require("../models/StudyPlan");
const asyncHandler = require("../middleware/asyncHandler");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// POST /api/study-plans/generate
exports.generatePlan = asyncHandler(async (req, res) => {
  const { studentId, planType, availableHoursPerDay, modules } = req.body;

  if (!planType || !availableHoursPerDay || !Array.isArray(modules) || modules.length === 0) {
    res.status(400);
    throw new Error("planType, availableHoursPerDay, modules[] are required");
  }

  // simple scoring: higher priority + lower progress => more time
  const scored = modules.map((m) => {
    const progress = Number(m.currentProgress ?? 0);
    const priority = Number(m.priority ?? 3);
    const need = (priority * 20) + (100 - progress); // bigger => more time
    return { ...m, progress, priority, need };
  });

  const totalNeed = scored.reduce((a, b) => a + b.need, 0);
  const minutesPerDay = Math.max(30, Math.floor(Number(availableHoursPerDay) * 60));

  const schedule = days.map((day) => {
    let remaining = minutesPerDay;

    const blocks = scored
      .sort((a, b) => b.need - a.need)
      .map((m) => {
        const share = Math.floor((m.need / totalNeed) * minutesPerDay);
        const minutes = Math.max(20, Math.min(share, remaining));
        remaining -= minutes;

        return {
          module: m.name,
          minutes,
          task: progressTask(m.progress),
        };
      })
      .filter((b) => b.minutes > 0);

    return { day, blocks };
  });

  const plan = await StudyPlan.create({
    studentId,
    planType,
    inputs: { availableHoursPerDay, modules: scored.map(({ name, priority, progress }) => ({ name, priority, currentProgress: progress })) },
    output: { schedule, notes: "Auto-generated basic plan. Later we will replace with AI optimization + exam dates + deadlines." },
  });

  res.status(201).json(plan);
});

function progressTask(progress) {
  if (progress < 30) return "Learn basics + watch lecture + short notes";
  if (progress < 70) return "Practice questions + summaries + past papers";
  return "Revision + timed mock test + weak-area review";
}

// GET /api/study-plans?studentId=xxx
exports.getPlans = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const filter = {};
  if (studentId) filter.studentId = studentId;

  const list = await StudyPlan.find(filter).sort({ createdAt: -1 });
  res.json(list);
});
