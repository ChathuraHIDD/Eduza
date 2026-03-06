const Module = require('../models/Module');
const asyncHandler = require('../middleware/asyncHandler');

// ─────────────────────────────────────────────────────────
// GET /api/modules
// Query params: lecturerId, status, approvalStatus, department, search
// ─────────────────────────────────────────────────────────
const getModules = asyncHandler(async (req, res) => {
  const { lecturerId, status, approvalStatus, department, search, limit = 100 } = req.query;

  const filter = {};
  if (lecturerId)     filter.lecturerId     = lecturerId;
  if (status)         filter.status         = status;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (department)     filter.department     = department;

  if (search) {
    filter.$or = [
      { code:        { $regex: search, $options: 'i' } },
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const modules = await Module.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(modules);
});

// ─────────────────────────────────────────────────────────
// GET /api/modules/:id
// ─────────────────────────────────────────────────────────
const getModuleById = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) {
    res.status(404);
    throw new Error('Module not found');
  }
  res.json(mod);
});

// ─────────────────────────────────────────────────────────
// GET /api/modules/code/:code
// ─────────────────────────────────────────────────────────
const getModuleByCode = asyncHandler(async (req, res) => {
  const mod = await Module.findOne({ code: req.params.code.toUpperCase() });
  if (!mod) {
    res.status(404);
    throw new Error('Module not found');
  }
  res.json(mod);
});

// ─────────────────────────────────────────────────────────
// POST /api/modules
// ─────────────────────────────────────────────────────────
const createModule = asyncHandler(async (req, res) => {
  const {
    code, name, description, department, faculty, credits, type, level,
    semester, academicYear, maxStudents, lecturerId, lecturerName, lecturerEmail,
    prerequisites, learningOutcomes, syllabus, tags, assessmentStructure,
    schedule,
  } = req.body;

  // Required fields check
  if (!code || !name || !department || !credits || !semester || !academicYear || !lecturerId || !lecturerName) {
    res.status(400);
    throw new Error('Missing required fields: code, name, department, credits, semester, academicYear, lecturerId, lecturerName');
  }

  // Validate assessment total = 100
  if (assessmentStructure) {
    const total = (assessmentStructure.assignments || 0)
                + (assessmentStructure.midExam || 0)
                + (assessmentStructure.finalExam || 0);
    if (total !== 100) {
      res.status(400);
      throw new Error(`Assessment percentages must sum to 100 (got ${total})`);
    }
  }

  // Sanitise tags
  const sanitisedTags = Array.isArray(tags)
    ? tags.map(t => String(t).trim()).filter(Boolean)
    : [];

  const mod = await Module.create({
    code, name, description, department, faculty, credits, type, level,
    semester, academicYear,
    maxStudents: maxStudents || 150,
    lecturerId, lecturerName, lecturerEmail: lecturerEmail || '',
    prerequisites: prerequisites || [],
    learningOutcomes: learningOutcomes || [],
    syllabus: syllabus || '',
    tags: sanitisedTags,
    assessmentStructure: assessmentStructure || { assignments: 20, midExam: 30, finalExam: 50 },
    schedule: schedule || { days: [], startTime: '', endTime: '', venue: '' },
    status: 'draft',
    approvalStatus: 'pending',
  });

  res.status(201).json(mod);
});

// ─────────────────────────────────────────────────────────
// PUT /api/modules/:id
// ─────────────────────────────────────────────────────────
const updateModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) {
    res.status(404);
    throw new Error('Module not found');
  }

  // Validate assessment total if provided
  if (req.body.assessmentStructure) {
    const a = req.body.assessmentStructure;
    const total = (a.assignments || 0) + (a.midExam || 0) + (a.finalExam || 0);
    if (total !== 100) {
      res.status(400);
      throw new Error(`Assessment percentages must sum to 100 (got ${total})`);
    }
  }

  // Prevent changing code to an existing one
  if (req.body.code && req.body.code.toUpperCase() !== mod.code) {
    const exists = await Module.findOne({ code: req.body.code.toUpperCase() });
    if (exists) {
      res.status(400);
      throw new Error('A module with that code already exists');
    }
  }

  Object.assign(mod, req.body);
  const updated = await mod.save();
  res.json(updated);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/modules/:id/approval
// Body: { approvalStatus, adminNote }
// ─────────────────────────────────────────────────────────
const updateApproval = asyncHandler(async (req, res) => {
  const { approvalStatus, adminNote } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
    res.status(400);
    throw new Error('approvalStatus must be pending | approved | rejected');
  }

  const mod = await Module.findById(req.params.id);
  if (!mod) {
    res.status(404);
    throw new Error('Module not found');
  }

  mod.approvalStatus = approvalStatus;
  mod.adminNote      = adminNote || '';
  // Auto-activate on approval
  if (approvalStatus === 'approved') mod.status = 'active';

  const updated = await mod.save();
  res.json(updated);
});

// ─────────────────────────────────────────────────────────
// DELETE /api/modules/:id
// ─────────────────────────────────────────────────────────
const deleteModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) {
    res.status(404);
    throw new Error('Module not found');
  }
  await mod.deleteOne();
  res.json({ message: 'Module deleted' });
});

module.exports = {
  getModules,
  getModuleById,
  getModuleByCode,
  createModule,
  updateModule,
  updateApproval,
  deleteModule,
};
