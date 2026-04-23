import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateKuppi.css";
import { createKuppiSession, getKuppiConductorApplications } from "../../utils/kuppiApi";

const getSessionTypeFromDate = (dateValue) => {
  if (!dateValue) return "upcoming";
  const today = new Date();
  const selected = new Date(dateValue);
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() === today.getTime() ? "today" : "upcoming";
};

function CreateKuppi() {
  const navigate = useNavigate();
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
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

    loadApprovedRequests();
  }, []);

  const selectedRequest = useMemo(
    () => approvedRequests.find((request) => request._id === selectedRequestId) || null,
    [approvedRequests, selectedRequestId]
  );

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
      alert("Kuppi session created successfully.");
      navigate("/admin/kuppi-details");
    } catch (err) {
      alert(err.message || "Failed to create Kuppi session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-kuppi-page">
      <section className="create-kuppi-hero">
        <div>
          <span className="create-kuppi-eyebrow">Admin Scheduling</span>
          <h1>Create Kuppi Session</h1>
          <p>Use approved conductor requests to schedule real Kuppi sessions for students.</p>
        </div>
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
    </div>
  );
}

export default CreateKuppi;
