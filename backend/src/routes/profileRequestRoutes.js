const express = require("express");
const {
  submitProfileRequest,
  getPendingRequests,
  getAllRequests,
  getRequestsByLecturer,
  getRequestById,
  updateRequestStatus,
} = require("../controllers/profileRequestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Lecturer - submit profile update request
router.post("/", protect, submitProfileRequest);

// Admin - get all pending requests
router.get("/pending", protect, authorizeRoles("admin"), getPendingRequests);

// Admin - get all requests
router.get("/all", protect, authorizeRoles("admin"), getAllRequests);

// Lecturer - get own requests
router.get("/lecturer/:lecturerId", protect, getRequestsByLecturer);

// Get single request
router.get("/:id", protect, getRequestById);

// Admin - update request status (approve/reject)
router.patch("/:id/status", protect, authorizeRoles("admin"), updateRequestStatus);

module.exports = router;
