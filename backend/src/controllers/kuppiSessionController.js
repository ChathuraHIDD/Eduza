const KuppiSession = require("../models/KuppiSession");
const KuppiConductorApplication = require("../models/KuppiConductorApplication");
const KuppiSessionPreference = require("../models/KuppiSessionPreference");
const Notification = require("../models/Notification");

const emitKuppiApplicationEvent = (req, eventName, payload) => {
  const io = req.app.get("io");
  if (io) {
    io.emit(eventName, payload);
  }
};

const createKuppiDecisionNotification = async (application) => {
  if (!application?.userId) {
    return;
  }

  if (!["approved", "rejected"].includes(application.status)) {
    return;
  }

  const title =
    application.status === "approved"
      ? "Kuppi Conductor Request Approved"
      : "Kuppi Conductor Request Rejected";

  const message =
    application.status === "approved"
      ? `Your request to conduct ${application.moduleLikeToDo} under ${application.mainSubject} has been approved by admin.`
      : `Your request to conduct ${application.moduleLikeToDo} under ${application.mainSubject} has been rejected by admin.`;

  await Notification.create({
    studentId: application.userId,
    channel: "IN_APP",
    title,
    message,
    status: "SENT",
    read: false,
  });
};

/**
 * @desc Create a new kuppi session
 * @route POST /api/kuppi-sessions
 */
const createKuppiSession = async (req, res) => {
  try {
    const {
      title,
      subject,
      moduleCode,
      description,
      conductorName,
      conductorUserId,
      year,
      semester,
      day,
      date,
      month,
      yearNumber,
      startTime,
      endTime,
      meetingLink,
      location,
      sessionType,
      category,
      maxParticipants,
    } = req.body;

    if (
      !title ||
      !subject ||
      !conductorName ||
      !year ||
      !semester ||
      !day ||
      !date ||
      !month ||
      !yearNumber ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const session = await KuppiSession.create({
      title,
      subject,
      moduleCode,
      description,
      conductorName,
      conductorUserId: conductorUserId || null,
      year,
      semester,
      day,
      date,
      month,
      yearNumber,
      startTime,
      endTime,
      timeRange: `${startTime} - ${endTime}`,
      meetingLink,
      location,
      sessionType,
      category,
      maxParticipants,
    });

    res.status(201).json({
      success: true,
      message: "Kuppi session created successfully",
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create kuppi session",
      error: error.message,
    });
  }
};

/**
 * @desc Get all kuppi sessions with filters
 * @route GET /api/kuppi-sessions
 */
const getAllKuppiSessions = async (req, res) => {
  try {
    const { day, subject, year, semester, month, date, yearNumber } = req.query;

    const filter = { isActive: true };

    if (day && day !== "All") filter.day = day;
    if (subject && subject !== "All") filter.subject = subject;
    if (year && year !== "All") filter.year = year;
    if (semester && semester !== "All") filter.semester = semester;
    if (month) filter.month = month;
    if (date) filter.date = Number(date);
    if (yearNumber) filter.yearNumber = Number(yearNumber);

    const sessions = await KuppiSession.find(filter).sort({
      yearNumber: 1,
      date: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch kuppi sessions",
      error: error.message,
    });
  }
};

/**
 * @desc Get single kuppi session
 * @route GET /api/kuppi-sessions/:id
 */
const getKuppiSessionById = async (req, res) => {
  try {
    const session = await KuppiSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Kuppi session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch kuppi session",
      error: error.message,
    });
  }
};

/**
 * @desc Apply as kuppi conductor
 * @route POST /api/kuppi-sessions/conductor/apply
 */
const applyAsKuppiConductor = async (req, res) => {
  try {
    const {
      fullName,
      mainSubject,
      moduleLikeToDo,
      currentStudyYear,
      currentSemester,
      cgpa,
      contact,
      availability,
      topicStrength,
      experience,
      userId,
    } = req.body;

    if (
      !fullName ||
      !mainSubject ||
      !moduleLikeToDo ||
      !currentStudyYear ||
      !currentSemester ||
      cgpa === undefined ||
      !contact ||
      !availability ||
      !topicStrength ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all application fields",
      });
    }

    const application = await KuppiConductorApplication.create({
      fullName,
      mainSubject,
      moduleLikeToDo,
      currentStudyYear,
      currentSemester,
      cgpa,
      contact,
      availability,
      topicStrength,
      experience,
      userId: userId || null,
    });

    emitKuppiApplicationEvent(req, "kuppi_application_created", application);

    res.status(201).json({
      success: true,
      message: "Kuppi conductor application submitted successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit conductor application",
      error: error.message,
    });
  }
};

/**
 * @desc Get conductor applications
 * @route GET /api/kuppi-sessions/conductor/applications
 */
const getKuppiConductorApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const applications = await KuppiConductorApplication.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch conductor applications",
      error: error.message,
    });
  }
};

/**
 * @desc Update conductor application status
 * @route PATCH /api/kuppi-sessions/conductor/applications/:id/status
 */
const updateKuppiConductorApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const application = await KuppiConductorApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Conductor application not found",
      });
    }

    application.status = status;
    await application.save();

    await createKuppiDecisionNotification(application);

    emitKuppiApplicationEvent(req, "kuppi_application_updated", application);

    res.status(200).json({
      success: true,
      message: "Conductor application updated successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update conductor application",
      error: error.message,
    });
  }
};

/**
 * @desc Pin/unpin a session
 * @route POST /api/kuppi-sessions/:sessionId/pin
 */
const togglePinKuppiSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const session = await KuppiSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Kuppi session not found",
      });
    }

    let preference = await KuppiSessionPreference.findOne({ userId, sessionId });

    if (!preference) {
      preference = await KuppiSessionPreference.create({
        userId,
        sessionId,
        isPinned: true,
      });

      return res.status(200).json({
        success: true,
        message: "Session pinned successfully",
        data: preference,
      });
    }

    preference.isPinned = !preference.isPinned;
    await preference.save();

    res.status(200).json({
      success: true,
      message: preference.isPinned
        ? "Session pinned successfully"
        : "Session unpinned successfully",
      data: preference,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pin status",
      error: error.message,
    });
  }
};

/**
 * @desc Set session reminder
 * @route POST /api/kuppi-sessions/:sessionId/reminder
 */
const setKuppiReminder = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, remindBeforeMinutes } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const session = await KuppiSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Kuppi session not found",
      });
    }

    let preference = await KuppiSessionPreference.findOne({ userId, sessionId });

    if (!preference) {
      preference = await KuppiSessionPreference.create({
        userId,
        sessionId,
        reminderEnabled: true,
        remindBeforeMinutes: remindBeforeMinutes || 120,
      });
    } else {
      preference.reminderEnabled = true;
      preference.remindBeforeMinutes = remindBeforeMinutes || 120;
      await preference.save();
    }

    res.status(200).json({
      success: true,
      message: `Reminder set ${preference.remindBeforeMinutes} minutes before session`,
      data: preference,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set reminder",
      error: error.message,
    });
  }
};

/**
 * @desc Get pinned sessions of a user
 * @route GET /api/kuppi-sessions/user/:userId/pinned
 */
const getPinnedKuppiSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const pinnedPreferences = await KuppiSessionPreference.find({
      userId,
      isPinned: true,
    }).populate("sessionId");

    const pinnedSessions = pinnedPreferences
      .map((item) => item.sessionId)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: pinnedSessions.length,
      data: pinnedSessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pinned sessions",
      error: error.message,
    });
  }
};

/**
 * @desc Get calendar sessions for month
 * @route GET /api/kuppi-sessions/calendar/month
 */
const getKuppiCalendarSessions = async (req, res) => {
  try {
    const { month, yearNumber, userId } = req.query;

    if (!month || !yearNumber) {
      return res.status(400).json({
        success: false,
        message: "month and yearNumber are required",
      });
    }

    const sessions = await KuppiSession.find({
      month,
      yearNumber: Number(yearNumber),
      isActive: true,
    });

    let pinnedSessionIds = [];

    if (userId) {
      const pinnedPreferences = await KuppiSessionPreference.find({
        userId,
        isPinned: true,
      });

      pinnedSessionIds = pinnedPreferences.map((item) => item.sessionId.toString());
    }

    const calendarData = sessions.map((session) => ({
      ...session.toObject(),
      isPinned: pinnedSessionIds.includes(session._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: calendarData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch calendar sessions",
      error: error.message,
    });
  }
};

module.exports = {
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
};
