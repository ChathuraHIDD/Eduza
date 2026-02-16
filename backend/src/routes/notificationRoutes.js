const router = require("express").Router();
const { createNotification, getNotifications } = require("../controllers/notificationController");

router.post("/", createNotification);
router.get("/", getNotifications);

module.exports = router;
