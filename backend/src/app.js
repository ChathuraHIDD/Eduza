const express = require("express");
const cors = require("cors");

const feedbackRoutes = require("./routes/feedbackRoutes");
const supportRoutes = require("./routes/supportRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
