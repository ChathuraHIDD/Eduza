import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import "./CreateKuppi.css";
import socket from "../../utils/socket";
import { drawEduzaLogo } from "../../utils/pdfBranding";
import {
  createKuppiSession,
  getKuppiConductorApplications,
  getKuppiSessions,
} from "../../utils/kuppiApi";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_FORM = {
  title: "",
  subject: "",
  moduleCode: "",
  description: "",
  conductorName: "",
  conductorUserId: "",
  year: "",
  semester: "",
  scheduleDate: "",
  startTime: "",
  endTime: "",
  meetingLink: "",
  location: "",
  category: "Approved Request",
  maxParticipants: 50,
};

const DEFAULT_REPORT_FILTERS = {
  scope: "filtered",
  name: "",
  startDate: "",
  endDate: "",
  year: "all",
  semester: "all",
};

const getSessionTypeFromDate = (dateValue) => {
  if (!dateValue) return "upcoming";
  const today = new Date();
  const selected = new Date(dateValue);
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() === today.getTime() ? "today" : "upcoming";
};

const toIsoDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseSessionDate = (session) => {
  if (session.scheduleDate) {
    const parsed = new Date(session.scheduleDate);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }

  if (session.yearNumber && session.month && session.date) {
    const parsed = new Date(`${session.month} ${session.date}, ${session.yearNumber}`);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }

  return null;
};

const formatSessionDateLabel = (date) =>
  date
    ? date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date not available";

const formatTimeRange = (session) => {
  if (!session.startTime && !session.endTime) return "Time not set";
  if (!session.startTime) return session.endTime;
  if (!session.endTime) return session.startTime;
  return `${session.startTime} - ${session.endTime}`;
};

const buildCalendarCells = (calendarDate, sessionDatesMap) => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({
      key: `blank-${index}`,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const key = toIsoDateKey(date);
    cells.push({
      key,
      date,
      isoKey: key,
      label: day,
      count: sessionDatesMap[key] || 0,
      isCurrentMonth: true,
    });
  }

  return cells;
};

function CreateKuppi() {
  const navigate = useNavigate();
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionsError, setSessionsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [reportFilters, setReportFilters] = useState(DEFAULT_REPORT_FILTERS);

  const loadApprovedRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getKuppiConductorApplications("approved");
      setApprovedRequests((response?.data || []).filter((request) => !request.createdSessionId));
    } catch (err) {
      setError(err.message || "Failed to load approved requests");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      setSessionsError("");
      const response = await getKuppiSessions();
      setSessions(response?.data || []);
    } catch (err) {
      setSessionsError(err.message || "Failed to load Kuppi sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedRequests();
    loadSessions();

    const handleSessionCreated = () => {
      loadApprovedRequests();
      loadSessions();
    };

    socket.on("kuppi_session_created", handleSessionCreated);

    return () => {
      socket.off("kuppi_session_created", handleSessionCreated);
    };
  }, []);

  const selectedRequest = useMemo(
    () => approvedRequests.find((request) => request._id === selectedRequestId) || null,
    [approvedRequests, selectedRequestId]
  );

  const sessionsWithDates = useMemo(
    () =>
      sessions
        .map((session) => {
          const scheduleDate = parseSessionDate(session);
          return {
            ...session,
            parsedScheduleDate: scheduleDate,
            dateKey: scheduleDate ? toIsoDateKey(scheduleDate) : "",
          };
        })
        .sort((left, right) => {
          const leftTime = left.parsedScheduleDate?.getTime() || Number.MAX_SAFE_INTEGER;
          const rightTime = right.parsedScheduleDate?.getTime() || Number.MAX_SAFE_INTEGER;
          return leftTime - rightTime;
        }),
    [sessions]
  );

  const upcomingSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessionsWithDates.filter((session) => {
      if (!session.parsedScheduleDate) {
        return false;
      }

      return session.parsedScheduleDate.getTime() >= today.getTime();
    });
  }, [sessionsWithDates]);

  const stats = useMemo(() => {
    const todayKey = toIsoDateKey(new Date());
    return {
      approvedRequests: approvedRequests.length,
      totalSessions: sessions.length,
      todaySessions: sessionsWithDates.filter((session) => session.dateKey === todayKey).length,
      monthSessions: sessionsWithDates.filter((session) => {
        if (!session.parsedScheduleDate) return false;
        return (
          session.parsedScheduleDate.getMonth() === calendarDate.getMonth() &&
          session.parsedScheduleDate.getFullYear() === calendarDate.getFullYear()
        );
      }).length,
    };
  }, [approvedRequests.length, calendarDate, sessions.length, sessionsWithDates]);

  const sessionDatesMap = useMemo(
    () =>
      sessionsWithDates.reduce((accumulator, session) => {
        if (!session.dateKey) {
          return accumulator;
        }
        accumulator[session.dateKey] = (accumulator[session.dateKey] || 0) + 1;
        return accumulator;
      }, {}),
    [sessionsWithDates]
  );

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarDate, sessionDatesMap),
    [calendarDate, sessionDatesMap]
  );

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) {
      return [];
    }

    return sessionsWithDates.filter((session) => session.dateKey === selectedCalendarDate);
  }, [selectedCalendarDate, sessionsWithDates]);

  const uniqueYears = useMemo(
    () => ["all", ...new Set(sessionsWithDates.map((session) => session.year).filter(Boolean))],
    [sessionsWithDates]
  );

  const uniqueSemesters = useMemo(
    () => ["all", ...new Set(sessionsWithDates.map((session) => session.semester).filter(Boolean))],
    [sessionsWithDates]
  );

  const reportResults = useMemo(() => {
    if (reportFilters.scope === "full") {
      return sessionsWithDates;
    }

    const query = reportFilters.name.trim().toLowerCase();

    return sessionsWithDates.filter((session) => {
      const sessionDate = session.parsedScheduleDate;
      const matchesName = query
        ? [session.title, session.subject, session.conductorName]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        : true;
      const matchesYear =
        reportFilters.year === "all" || session.year === reportFilters.year;
      const matchesSemester =
        reportFilters.semester === "all" || session.semester === reportFilters.semester;
      const matchesStart = reportFilters.startDate
        ? sessionDate && sessionDate >= new Date(`${reportFilters.startDate}T00:00:00`)
        : true;
      const matchesEnd = reportFilters.endDate
        ? sessionDate && sessionDate <= new Date(`${reportFilters.endDate}T23:59:59`)
        : true;

      return matchesName && matchesYear && matchesSemester && matchesStart && matchesEnd;
    });
  }, [reportFilters, sessionsWithDates]);

  const handleRequestSelect = (event) => {
    const requestId = event.target.value;
    setSelectedRequestId(requestId);

    const request = approvedRequests.find((item) => item._id === requestId);
    if (!request) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      title: `${request.mainSubject} Kuppi`,
      subject: request.mainSubject,
      moduleCode: request.moduleLikeToDo,
      description: request.experience || "",
      conductorName: request.fullName,
      conductorUserId: request.userId || "",
      year: request.currentStudyYear,
      semester: request.currentSemester,
      category: "Approved Request",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCalendarDateClick = (isoKey) => {
    setSelectedCalendarDate(isoKey);
    setFormData((prev) => ({
      ...prev,
      scheduleDate: isoKey,
    }));
  };

  const changeCalendarMonth = (direction) => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleReportFilterChange = (event) => {
    const { name, value } = event.target;
    setReportFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRequest) {
      alert("Select an approved request first.");
      return;
    }

    try {
      setSubmitting(true);
      const schedule = new Date(formData.scheduleDate);
      const payload = {
        applicationId: selectedRequest._id,
        title: formData.title,
        subject: formData.subject,
        moduleCode: formData.moduleCode,
        description: formData.description,
        conductorName: formData.conductorName,
        conductorUserId: formData.conductorUserId || null,
        year: formData.year,
        semester: formData.semester,
        day: schedule.toLocaleDateString("en-US", { weekday: "long" }),
        date: schedule.getDate(),
        month: schedule.toLocaleDateString("en-US", { month: "long" }),
        yearNumber: schedule.getFullYear(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        meetingLink: formData.meetingLink,
        location: formData.location,
        sessionType: getSessionTypeFromDate(formData.scheduleDate),
        category: formData.category,
        maxParticipants: Number(formData.maxParticipants || 50),
      };

      await createKuppiSession(payload);
      await Promise.all([loadApprovedRequests(), loadSessions()]);
      setSelectedRequestId("");
      setFormData(DEFAULT_FORM);
      setSelectedCalendarDate(payload.yearNumber && formData.scheduleDate ? formData.scheduleDate : "");
      alert("Kuppi session created successfully.");
    } catch (err) {
      alert(err.message || "Failed to create Kuppi session.");
    } finally {
      setSubmitting(false);
    }
  };

  const generatePdfReport = async () => {
    try {
      setReportGenerating(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 42;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = 110;

      const addPageFooter = (pageNumber) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("EDUZA Kuppi Sessions Report", margin, pageHeight - 20);
        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 20, { align: "right" });
      };

      const drawHeader = async () => {
        doc.setFillColor(255, 247, 237);
        doc.rect(0, 0, pageWidth, 88, "F");
        doc.setFillColor(249, 115, 22);
        doc.rect(0, 0, 10, 88, "F");
        await drawEduzaLogo(doc, margin, 24, 42, 28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59);
        doc.text("Kuppi Session Report", margin + 54, 42);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on ${new Date().toLocaleString()}`, margin + 54, 60);
        doc.text("Created sessions summary for admin scheduling and planning", margin + 54, 74);
      };

      const ensureSpace = (neededHeight, pageNumberRef) => {
        if (cursorY + neededHeight <= pageHeight - 42) {
          return pageNumberRef;
        }

        addPageFooter(pageNumberRef.current);
        doc.addPage();
        pageNumberRef.current += 1;
        cursorY = 50;
        return pageNumberRef;
      };

      const drawSectionTitle = (title, pageNumberRef) => {
        ensureSpace(28, pageNumberRef);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text(title, margin, cursorY);
        cursorY += 18;
      };

      const pageNumberRef = { current: 1 };
      await drawHeader();

      drawSectionTitle("Filter Summary", pageNumberRef);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      [
        `Report Type: ${reportFilters.scope === "full" ? "Full Report" : "Filtered Report"}`,
        `Name: ${reportFilters.name || "All"}`,
        `Date From: ${reportFilters.startDate || "Any"}`,
        `Date To: ${reportFilters.endDate || "Any"}`,
        `Year: ${reportFilters.year === "all" ? "All Years" : reportFilters.year}`,
        `Semester: ${reportFilters.semester === "all" ? "All Semesters" : reportFilters.semester}`,
      ].forEach((line) => {
        ensureSpace(16, pageNumberRef);
        doc.text(line, margin, cursorY);
        cursorY += 14;
      });

      cursorY += 10;
      drawSectionTitle("Summary", pageNumberRef);
      [
        `Matched Sessions: ${reportResults.length}`,
        `Upcoming Sessions: ${reportResults.filter((session) => {
          if (!session.parsedScheduleDate) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return session.parsedScheduleDate >= today;
        }).length}`,
        `Online Sessions: ${reportResults.filter((session) => session.meetingLink).length}`,
        `Physical Sessions: ${reportResults.filter((session) => !session.meetingLink).length}`,
      ].forEach((line) => {
        ensureSpace(16, pageNumberRef);
        doc.text(line, margin, cursorY);
        cursorY += 14;
      });

      cursorY += 10;
      drawSectionTitle("Session Records", pageNumberRef);

      const drawTableHeader = () => {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, cursorY, contentWidth, 24, 6, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text("Title", margin + 10, cursorY + 15);
        doc.text("Conductor", margin + 190, cursorY + 15);
        doc.text("Date", margin + 320, cursorY + 15);
        doc.text("Academic", margin + 420, cursorY + 15);
        cursorY += 32;
      };

      drawTableHeader();

      if (reportResults.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("No created Kuppi sessions matched the selected report filters.", margin, cursorY);
        cursorY += 16;
      }

      reportResults.forEach((session, index) => {
        if (cursorY + 48 > pageHeight - 42) {
          addPageFooter(pageNumberRef.current);
          doc.addPage();
          pageNumberRef.current += 1;
          cursorY = 50;
          drawTableHeader();
        }

        doc.setFillColor(index % 2 === 0 ? 255 : 250, 250, 248);
        doc.roundedRect(margin, cursorY - 4, contentWidth, 40, 6, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(session.title || "Untitled", margin + 10, cursorY + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(session.subject || "-", margin + 10, cursorY + 24);
        doc.text(session.conductorName || "-", margin + 190, cursorY + 10);
        doc.text(formatSessionDateLabel(session.parsedScheduleDate), margin + 320, cursorY + 10);
        doc.text(formatTimeRange(session), margin + 320, cursorY + 24);
        doc.text(`${session.year || "-"} / ${session.semester || "-"}`, margin + 420, cursorY + 10);
        doc.text(session.location || (session.meetingLink ? "Online" : "-"), margin + 420, cursorY + 24);
        cursorY += 48;
      });

      addPageFooter(pageNumberRef.current);
      doc.save("kuppi-sessions-report.pdf");
    } finally {
      setReportGenerating(false);
    }
  };

  return (
    <div className="create-kuppi-page">
      <section className="create-kuppi-hero">
        <div>
          <span className="create-kuppi-eyebrow">Admin Scheduling</span>
          <h1>Create Kuppi Session</h1>
          <p>Schedule approved requests, track upcoming Kuppis on the calendar, and generate simple reports from one page.</p>
        </div>

        <div className="create-kuppi-hero-actions">
          <button type="button" className="create-kuppi-secondary-btn" onClick={() => navigate("/admin/kuppi-details")}>
            Back to Details
          </button>
        </div>
      </section>

      <section className="create-kuppi-stats">
        <article className="create-kuppi-stat-card">
          <span>Approved Requests</span>
          <strong>{stats.approvedRequests}</strong>
          <p>Ready to become live Kuppi sessions.</p>
        </article>

        <article className="create-kuppi-stat-card">
          <span>Total Created Sessions</span>
          <strong>{stats.totalSessions}</strong>
          <p>Sessions already visible to students.</p>
        </article>

        <article className="create-kuppi-stat-card">
          <span>Today&apos;s Sessions</span>
          <strong>{stats.todaySessions}</strong>
          <p>Scheduled for the current day.</p>
        </article>

        <article className="create-kuppi-stat-card">
          <span>This Month</span>
          <strong>{stats.monthSessions}</strong>
          <p>Sessions inside the current calendar month.</p>
        </article>
      </section>

      <div className="create-kuppi-layout">
        <section className="create-kuppi-panel">
          <div className="create-kuppi-section-head">
            <div>
              <h2>Approved Requests</h2>
              <p>Select an approved request that should become a live Kuppi session.</p>
            </div>
          </div>

          {loading && <div className="create-kuppi-empty">Loading approved requests...</div>}
          {error && <div className="create-kuppi-empty create-kuppi-error">{error}</div>}

          {!loading && !error && approvedRequests.length === 0 && (
            <div className="create-kuppi-empty">No approved requests available for scheduling.</div>
          )}

          {!loading && !error && approvedRequests.length > 0 && (
            <>
              <div className="create-kuppi-field">
                <label>Approved Request</label>
                <select value={selectedRequestId} onChange={handleRequestSelect}>
                  <option value="">Select an approved request</option>
                  {approvedRequests.map((request) => (
                    <option key={request._id} value={request._id}>
                      {request.fullName} - {request.mainSubject} - {request.moduleLikeToDo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-kuppi-request-list">
                {approvedRequests.slice(0, 5).map((request) => (
                  <button
                    type="button"
                    key={request._id}
                    className={`create-kuppi-request-chip ${selectedRequestId === request._id ? "is-active" : ""}`}
                    onClick={() => handleRequestSelect({ target: { value: request._id } })}
                  >
                    <strong>{request.fullName}</strong>
                    <span>{request.mainSubject}</span>
                  </button>
                ))}
              </div>

              {selectedRequest && (
                <div className="create-kuppi-request-card">
                  <h3>{selectedRequest.fullName}</h3>
                  <p>{selectedRequest.mainSubject}</p>
                  <span>{selectedRequest.moduleLikeToDo}</span>
                  <span>
                    {selectedRequest.currentStudyYear} / {selectedRequest.currentSemester}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        <section className="create-kuppi-panel">
          <div className="create-kuppi-section-head">
            <div>
              <h2>Session Details</h2>
              <p>Fill the session schedule and meeting details for students.</p>
            </div>
          </div>

          <form className="create-kuppi-form" onSubmit={handleSubmit}>
            <div className="create-kuppi-grid">
              <div className="create-kuppi-field">
                <label>Session Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>Subject</label>
                <input name="subject" value={formData.subject} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>Module Code</label>
                <input name="moduleCode" value={formData.moduleCode} onChange={handleChange} />
              </div>

              <div className="create-kuppi-field">
                <label>Conductor Name</label>
                <input name="conductorName" value={formData.conductorName} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>Year</label>
                <select name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="create-kuppi-field">
                <label>Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} required>
                  <option value="">Select semester</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>

              <div className="create-kuppi-field">
                <label>Schedule Date</label>
                <input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>Max Participants</label>
                <input
                  type="number"
                  min="1"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-kuppi-field">
                <label>Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>

              <div className="create-kuppi-field">
                <label>Meeting Link</label>
                <input name="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className="create-kuppi-field">
                <label>Location</label>
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Lab / Hall / Online" />
              </div>
            </div>

            <div className="create-kuppi-field">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Share what students can expect from this Kuppi session."
              />
            </div>

            <div className="create-kuppi-actions">
              <button type="button" className="create-kuppi-secondary-btn" onClick={() => navigate("/admin/kuppi-details")}>
                Back
              </button>
              <button type="submit" className="create-kuppi-primary-btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create Kuppi"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="create-kuppi-insight-grid">
        <article className="create-kuppi-panel">
          <div className="create-kuppi-section-head create-kuppi-section-head-inline">
            <div>
              <h2>Kuppi Calendar</h2>
              <p>Click a date to see scheduled sessions and quickly fill the form date.</p>
            </div>

            <div className="create-kuppi-calendar-nav">
              <button type="button" onClick={() => changeCalendarMonth(-1)}>
                Previous
              </button>
              <strong>
                {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </strong>
              <button type="button" onClick={() => changeCalendarMonth(1)}>
                Next
              </button>
            </div>
          </div>

          <div className="create-kuppi-calendar-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="create-kuppi-calendar-grid">
            {calendarCells.map((cell) =>
              cell.isCurrentMonth ? (
                <button
                  key={cell.key}
                  type="button"
                  className={`create-kuppi-calendar-cell ${selectedCalendarDate === cell.isoKey ? "is-selected" : ""} ${
                    cell.count > 0 ? "has-session" : ""
                  }`}
                  onClick={() => handleCalendarDateClick(cell.isoKey)}
                >
                  <span>{cell.label}</span>
                  {cell.count > 0 && <small>{cell.count} Kuppi</small>}
                </button>
              ) : (
                <div key={cell.key} className="create-kuppi-calendar-cell is-empty"></div>
              )
            )}
          </div>

          <div className="create-kuppi-calendar-detail">
            <h3>{selectedCalendarDate ? `Sessions on ${selectedCalendarDate}` : "Select a date"}</h3>

            {selectedCalendarDate && sessionsForSelectedDate.length === 0 && (
              <p>No sessions scheduled for this day yet.</p>
            )}

            {!selectedCalendarDate && <p>Select a calendar date to inspect the schedule.</p>}

            {sessionsForSelectedDate.length > 0 && (
              <div className="create-kuppi-calendar-session-list">
                {sessionsForSelectedDate.map((session) => (
                  <div key={session._id || `${session.title}-${session.dateKey}`} className="create-kuppi-mini-session">
                    <strong>{session.title}</strong>
                    <span>{formatTimeRange(session)}</span>
                    <span>{session.conductorName || "Unknown conductor"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="create-kuppi-panel">
          <div className="create-kuppi-section-head">
            <div>
              <h2>Upcoming Kuppi Sessions</h2>
              <p>These created sessions will appear on the student Kuppi page.</p>
            </div>
          </div>

          {sessionsLoading && <div className="create-kuppi-empty">Loading sessions...</div>}
          {sessionsError && <div className="create-kuppi-empty create-kuppi-error">{sessionsError}</div>}

          {!sessionsLoading && !sessionsError && upcomingSessions.length === 0 && (
            <div className="create-kuppi-empty">No upcoming Kuppi sessions have been created yet.</div>
          )}

          {!sessionsLoading && !sessionsError && upcomingSessions.length > 0 && (
            <div className="create-kuppi-session-list">
              {upcomingSessions.slice(0, 8).map((session) => (
                <div key={session._id || `${session.title}-${session.dateKey}`} className="create-kuppi-session-card">
                  <div className="create-kuppi-session-top">
                    <div>
                      <h3>{session.title}</h3>
                      <p>{formatSessionDateLabel(session.parsedScheduleDate)}</p>
                    </div>
                    <span className="create-kuppi-session-badge">{session.year || "All"}</span>
                  </div>

                  <div className="create-kuppi-session-meta">
                    <span>{formatTimeRange(session)}</span>
                    <span>{session.conductorName || "Unknown conductor"}</span>
                    <span>{session.semester || "Semester not set"}</span>
                    <span>{session.meetingLink ? "Online" : session.location || "Physical"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="create-kuppi-panel">
        <div className="create-kuppi-section-head">
          <div>
            <h2>Report Generator</h2>
            <p>Create a simple PDF report using date wise, name wise, year wise, semester wise, or full report filters.</p>
          </div>
        </div>

        <div className="create-kuppi-report-grid">
          <div className="create-kuppi-field">
            <label>Report Type</label>
            <select name="scope" value={reportFilters.scope} onChange={handleReportFilterChange}>
              <option value="filtered">Filtered Report</option>
              <option value="full">Full Report</option>
            </select>
          </div>

          <div className="create-kuppi-field">
            <label>Name Wise</label>
            <input
              type="text"
              name="name"
              value={reportFilters.name}
              onChange={handleReportFilterChange}
              placeholder="Search title, subject, or conductor"
              disabled={reportFilters.scope === "full"}
            />
          </div>

          <div className="create-kuppi-field">
            <label>Date From</label>
            <input
              type="date"
              name="startDate"
              value={reportFilters.startDate}
              onChange={handleReportFilterChange}
              disabled={reportFilters.scope === "full"}
            />
          </div>

          <div className="create-kuppi-field">
            <label>Date To</label>
            <input
              type="date"
              name="endDate"
              value={reportFilters.endDate}
              onChange={handleReportFilterChange}
              disabled={reportFilters.scope === "full"}
            />
          </div>

          <div className="create-kuppi-field">
            <label>Year Wise</label>
            <select
              name="year"
              value={reportFilters.year}
              onChange={handleReportFilterChange}
              disabled={reportFilters.scope === "full"}
            >
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>

          <div className="create-kuppi-field">
            <label>Semester Wise</label>
            <select
              name="semester"
              value={reportFilters.semester}
              onChange={handleReportFilterChange}
              disabled={reportFilters.scope === "full"}
            >
              {uniqueSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester === "all" ? "All Semesters" : semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="create-kuppi-report-bar">
          <div className="create-kuppi-report-summary">
            <strong>{reportResults.length}</strong>
            <span>sessions match the current report filters</span>
          </div>

          <button type="button" className="create-kuppi-primary-btn" onClick={generatePdfReport} disabled={reportGenerating}>
            {reportGenerating ? "Generating..." : "Generate PDF Report"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default CreateKuppi;
