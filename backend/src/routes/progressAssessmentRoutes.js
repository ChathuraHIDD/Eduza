const express = require("express");
const {
  listAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  listAttempts,
  createAttempt,
  updateAttempt,
} = require("../controllers/progressAssessmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(listAssessments)
  .post(authorizeRoles("lecturer", "coordinator", "admin"), createAssessment);

router
  .route("/:id")
  .put(authorizeRoles("lecturer", "coordinator", "admin"), updateAssessment)
  .delete(authorizeRoles("lecturer", "coordinator", "admin"), deleteAssessment);

router.route("/attempts").get(listAttempts).post(createAttempt);
router.route("/attempts/:id").patch(updateAttempt);

module.exports = router;
