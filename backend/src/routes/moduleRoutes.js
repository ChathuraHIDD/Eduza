const express = require('express');
const router  = express.Router();
const {
  getModules,
  getModuleById,
  getModuleByCode,
  createModule,
  updateModule,
  updateApproval,
  deleteModule,
  uploadWeekPdf,
  uploadWeekPdfMiddleware,
} = require('../controllers/moduleController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post(
  '/upload-week-pdf',
  protect,
  authorizeRoles('lecturer', 'coordinator', 'admin'),
  uploadWeekPdfMiddleware.single('file'),
  uploadWeekPdf
);

// List / create
router.route('/')
  .get(protect, getModules)
  .post(protect, authorizeRoles('lecturer', 'coordinator', 'admin'), createModule);

// By code (must come before :id to avoid matching 'code' as an id)
router.get('/code/:code', protect, getModuleByCode);

// Single by MongoDB id
router.route('/:id')
  .get(protect, getModuleById)
  .put(protect, authorizeRoles('lecturer', 'coordinator', 'admin'), updateModule)
  .delete(protect, authorizeRoles('admin'), deleteModule);

// Admin approval
router.patch('/:id/approval', protect, authorizeRoles('admin'), updateApproval);

module.exports = router;
