const asyncHandler = require("../middleware/asyncHandler");
const GpaProfile = require("../models/GpaProfile");
const ALLOWED_CREDITS = [1, 2, 3, 4];

const sanitizeModules = (modules) => {
  if (!Array.isArray(modules)) return [];

  return modules.map((module, index) => ({
    id: String(module?.id || Date.now() + index),
    moduleName: String(module?.moduleName || "").trim(),
    credits: ALLOWED_CREDITS.includes(Number(module?.credits))
      ? Number(module?.credits)
      : 3,
    grade: String(module?.grade || "A").trim(),
  }));
};

const getGpaProfile = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const profile = await GpaProfile.findOne({ user: userId });

  if (!profile) {
    return res.json({
      selectedMode: "Custom-Add your own",
      modules: [{ id: "1", moduleName: "", credits: 3, grade: "A" }],
    });
  }

  res.json(profile);
});

const upsertGpaProfile = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const selectedMode = String(req.body?.selectedMode || "Custom-Add your own");
  const modules = sanitizeModules(req.body?.modules);

  if (modules.length === 0) {
    res.status(400);
    throw new Error("At least one GPA module is required");
  }

  const payload = {
    user: userId,
    selectedMode,
    modules,
  };

  const updated = await GpaProfile.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(updated);
});

module.exports = {
  getGpaProfile,
  upsertGpaProfile,
};
