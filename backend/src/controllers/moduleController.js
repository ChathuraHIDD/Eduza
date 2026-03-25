const Module = require('../models/Module');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const STAFF_ROLES = ['lecturer', 'coordinator', 'admin'];
const FACULTY_CODES = ['IT', 'EN', 'HS', 'BS'];
const SEMESTER_OPTIONS = ['Jan-Jun Semester', 'July-Dec Semester'];

const uploadsRoot = path.join(__dirname, '../../uploads/modules');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf';
    const safeBase = path
      .basename(file.originalname || 'lecture', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 60) || 'lecture';
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const pdfFileFilter = (_req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname || '').toLowerCase() === '.pdf';
  if (!isPdfMime && !isPdfExt) {
    return cb(new Error('Only PDF files are allowed'));
  }
  cb(null, true);
};

const uploadWeekPdfMiddleware = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const sanitizeWeeklySyllabus = (weeklySyllabus = []) => {
  if (!Array.isArray(weeklySyllabus)) {
    return [];
  }

  return weeklySyllabus.slice(0, 12).map((week, idx) => ({
    weekNumber: Number(week.weekNumber) || idx + 1,
    topic: String(week.topic || '').trim(),
    instructionText: String(week.instructionText || '').trim(),
    pdfFileName: String(week.pdfFileName || '').trim(),
    pdfFileUrl: String(week.pdfFileUrl || '').trim(),
  }));
};

const uploadWeekPdf = asyncHandler(async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.role)) {
    res.status(403);
    throw new Error('Only staff users can upload weekly PDFs');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const weekNumber = Number(req.body.weekNumber);
  if (!weekNumber || weekNumber < 1 || weekNumber > 12) {
    res.status(400);
    throw new Error('weekNumber must be between 1 and 12');
  }

  const fileUrl = `/uploads/modules/${req.file.filename}`;

  res.status(201).json({
    weekNumber,
    pdfFileName: req.file.originalname,
    storedFileName: req.file.filename,
    pdfFileUrl: fileUrl,
    size: req.file.size,
  });
});

// ─────────────────────────────────────────────────────────
// GET /api/modules
// Query params: lecturerId, status, approvalStatus, department, semester, academicYear, level, search
// ─────────────────────────────────────────────────────────
const getModules = asyncHandler(async (req, res) => {
  const {
    lecturerId,
    status,
    approvalStatus,
    department,
    semester,
    academicYear,
    level,
    search,
    limit = 100,
  } = req.query;

  const filter = {};
  if (lecturerId)     filter.lecturerId     = lecturerId;
  if (status)         filter.status         = status;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (department)     filter.department     = department;
  if (semester)       filter.semester       = semester;
  if (academicYear)   filter.academicYear   = academicYear;
  if (level)          filter.level          = level;

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
    semester, academicYear, maxStudents,
    prerequisites, learningOutcomes, syllabus, weeklySyllabus, tags, assessmentStructure,
    schedule,
  } = req.body;

  if (!STAFF_ROLES.includes(req.user.role)) {
    res.status(403);
    throw new Error('Only staff users can create modules');
  }

  // Required fields check
  if (!code || !name || !department || !credits || !semester || !academicYear) {
    res.status(400);
    throw new Error('Missing required fields: code, name, department, credits, semester, academicYear');
  }

  if (!FACULTY_CODES.includes(faculty)) {
    res.status(400);
    throw new Error(`faculty must be one of: ${FACULTY_CODES.join(', ')}`);
  }

  if (!SEMESTER_OPTIONS.includes(semester)) {
    res.status(400);
    throw new Error(`semester must be one of: ${SEMESTER_OPTIONS.join(' | ')}`);
  }

  const normalizedWeeklySyllabus = sanitizeWeeklySyllabus(weeklySyllabus);
  if (normalizedWeeklySyllabus.length < 1 || normalizedWeeklySyllabus.length > 12) {
    res.status(400);
    throw new Error('weeklySyllabus must include between 1 and 12 weeks');
  }
  if (normalizedWeeklySyllabus.some((w) => !w.topic || !w.instructionText)) {
    res.status(400);
    throw new Error('Each weekly syllabus entry must include topic and instructionText');
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
    lecturerId: String(req.user._id),
    lecturerName: req.user.name,
    lecturerEmail: req.user.email || '',
    prerequisites: prerequisites || [],
    learningOutcomes: learningOutcomes || [],
    syllabus: syllabus || '',
    weeklySyllabus: normalizedWeeklySyllabus,
    tags: sanitisedTags,
    assessmentStructure: assessmentStructure || { assignments: 20, midExam: 30, finalExam: 50 },
    schedule: schedule || { days: [], startTime: '', endTime: '', venue: '' },
    status: 'draft',
    approvalStatus: 'pending',
  });

  // Best-effort in-app notification record for admin review queue.
  await Notification.create({
    channel: 'IN_APP',
    title: 'New Module Approval Request',
    message: `${req.user.name} submitted module ${mod.code} (${mod.name}) for approval.`,
    status: 'PENDING',
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

  if (!STAFF_ROLES.includes(req.user.role)) {
    res.status(403);
    throw new Error('Only staff users can update modules');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = String(mod.lecturerId) === String(req.user._id);
  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error('You can update only your own modules');
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

  if (req.body.faculty && !FACULTY_CODES.includes(req.body.faculty)) {
    res.status(400);
    throw new Error(`faculty must be one of: ${FACULTY_CODES.join(', ')}`);
  }

  if (req.body.semester && !SEMESTER_OPTIONS.includes(req.body.semester)) {
    res.status(400);
    throw new Error(`semester must be one of: ${SEMESTER_OPTIONS.join(' | ')}`);
  }

  if (req.body.weeklySyllabus) {
    const normalizedWeeklySyllabus = sanitizeWeeklySyllabus(req.body.weeklySyllabus);
    if (normalizedWeeklySyllabus.length < 1 || normalizedWeeklySyllabus.length > 12) {
      res.status(400);
      throw new Error('weeklySyllabus must include between 1 and 12 weeks');
    }
    if (normalizedWeeklySyllabus.some((w) => !w.topic || !w.instructionText)) {
      res.status(400);
      throw new Error('Each weekly syllabus entry must include topic and instructionText');
    }
    req.body.weeklySyllabus = normalizedWeeklySyllabus;
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

  // Non-admin updates must go through approval again.
  if (!isAdmin) {
    mod.approvalStatus = 'pending';
    mod.status = 'draft';
    mod.adminNote = '';
  }

  const updated = await mod.save();

  if (!isAdmin) {
    await Notification.create({
      channel: 'IN_APP',
      title: 'Module Update Approval Request',
      message: `${req.user.name} submitted an update for module ${updated.code} (${updated.name}) for approval.`,
      status: 'PENDING',
    });
  }

  res.json(updated);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/modules/:id/approval
// Body: { approvalStatus, adminNote }
// ─────────────────────────────────────────────────────────
const updateApproval = asyncHandler(async (req, res) => {
  const { approvalStatus, adminNote } = req.body;
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can approve or reject modules');
  }

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
  uploadWeekPdf,
  uploadWeekPdfMiddleware,
};
