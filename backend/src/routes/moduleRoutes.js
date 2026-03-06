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
} = require('../controllers/moduleController');

// List / create
router.route('/')
  .get(getModules)
  .post(createModule);

// By code (must come before :id to avoid matching 'code' as an id)
router.get('/code/:code', getModuleByCode);

// Single by MongoDB id
router.route('/:id')
  .get(getModuleById)
  .put(updateModule)
  .delete(deleteModule);

// Admin approval
router.patch('/:id/approval', updateApproval);

module.exports = router;
