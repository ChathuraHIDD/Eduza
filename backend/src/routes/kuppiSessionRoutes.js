const express = require("express");
const router = express.Router();

const {
  createKuppiSession,
  getAllKuppiSessions,
  getKuppiSessionById,
  applyAsKuppiConductor,
  togglePinKuppiSession,
  setKuppiReminder,
  getPinnedKuppiSessions,
  getKuppiCalendarSessions,
} = require("../controllers/kuppiSessionController");

router.post("/", createKuppiSession);
router.get("/", getAllKuppiSessions);
router.get("/calendar/month", getKuppiCalendarSessions);
router.get("/user/:userId/pinned", getPinnedKuppiSessions);
router.get("/:id", getKuppiSessionById);

router.post("/conductor/apply", applyAsKuppiConductor);
router.post("/:sessionId/pin", togglePinKuppiSession);
router.post("/:sessionId/reminder", setKuppiReminder);

module.exports = router;