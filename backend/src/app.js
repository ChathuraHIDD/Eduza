const express = require("express");
const cors = require("cors");
const path = require("path");

const feedbackRoutes = require("./routes/feedbackRoutes");
const supportRoutes = require("./routes/supportRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const stressHubRoutes = require('./routes/stressHubRoutes');
const progressLogRoutes = require("./routes/progressLogRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const mlRoutes = require("./routes/mlRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const kuppiSessionRoutes = require("./routes/kuppiSessionRoutes");
const profileRequestRoutes = require("./routes/profileRequestRoutes");
const chatRoutes = require("./routes/chatRoutes");
const chatUserRoutes = require("./routes/chatUserRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes"); // login/register

const softwareRoutes = require("./routes/softwareRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EDUCE backend running" });
});

// Routes
app.use("/api/feedback", feedbackRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use('/api/stress-hub', stressHubRoutes);
app.use("/api/progress-logs", progressLogRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/software", softwareRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/kuppi-sessions", kuppiSessionRoutes);
app.use("/api/profile-requests", profileRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat-users", chatUserRoutes);

//Login and Registration
app.use("/api/auth", authRoutes); // login/register

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
