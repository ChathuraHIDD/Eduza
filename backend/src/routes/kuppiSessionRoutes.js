const express = require("express");
const router = express.Router();

const {
  createKuppiSession,
  getAllKuppiSessions,
  getKuppiSessionById,
  applyAsKuppiConductor,
  getKuppiConductorApplications,
  updateKuppiConductorApplicationStatus,
  togglePinKuppiSession,
  setKuppiReminder,
  getPinnedKuppiSessions,
  getKuppiCalendarSessions,
} = require("../controllers/kuppiSessionController");

router.post("/", createKuppiSession);
router.get("/", getAllKuppiSessions);
router.get("/calendar/month", getKuppiCalendarSessions);
router.get("/conductor/applications", getKuppiConductorApplications);
router.get("/user/:userId/pinned", getPinnedKuppiSessions);

router.post("/conductor/apply", applyAsKuppiConductor);
router.patch("/conductor/applications/:id/status", updateKuppiConductorApplicationStatus);
router.post("/:sessionId/pin", togglePinKuppiSession);
router.post("/:sessionId/reminder", setKuppiReminder);
router.get("/:id", getKuppiSessionById);

module.exports = router;
