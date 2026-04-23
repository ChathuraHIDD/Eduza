import React, { useEffect, useMemo, useState } from "react";
import "./AdminKuppiDetails.css";
import socket from "../../utils/socket";
import {
  getKuppiConductorApplications,
  updateKuppiConductorApplicationStatus,
} from "../../utils/kuppiApi";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"];

const scheduledSessions = [
  {
    title: "Algorithms Kuppi",
    conductor: "Malmi",
    audience: "3rd Year / Semester 1",
    time: "Tuesday, 3:00 PM - 4:30 PM",
    mode: "Online",
  },
  {
    title: "Web Development Kuppi",
    conductor: "Kasuni",
    audience: "3rd Year / Semester 1",
    time: "Wednesday, 1:00 PM - 2:30 PM",
    mode: "Physical",
  },
  {
    title: "Java Programming Kuppi",
    conductor: "Sachini",
    audience: "1st Year / Semester 2",
    time: "Friday, 10:00 AM - 11:30 AM",
    mode: "Online",
  },
];

function AdminKuppiDetails() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [processingId, setProcessingId] = useState("");

  useEffect(() => {
    loadApplications();

    const handleCreated = (application) => {
      setApplications((prev) => [application, ...prev.filter((item) => item._id !== application._id)]);
    };

    const handleUpdated = (application) => {
      setApplications((prev) =>
        prev.map((item) => (item._id === application._id ? application : item))
      );
    };

    socket.on("kuppi_application_created", handleCreated);
    socket.on("kuppi_application_updated", handleUpdated);

    return () => {
      socket.off("kuppi_application_created", handleCreated);
      socket.off("kuppi_application_updated", handleUpdated);
    };
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getKuppiConductorApplications();
      setApplications(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load Kuppi applications");
    } finally {
      setLoading(false);
    }
  };

  const visibleApplications = useMemo(() => {
    if (filter === "all") {
      return applications;
    }
    return applications.filter((application) => application.status === filter);
  }, [applications, filter]);

  const selectedApplication = useMemo(() => {
    if (!selectedApplicationId) {
      return visibleApplications[0] || applications[0] || null;
    }

    return (
      applications.find((application) => application._id === selectedApplicationId) ||
      visibleApplications[0] ||
      applications[0] ||
      null
    );
  }, [applications, selectedApplicationId, visibleApplications]);

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((application) => application.status === "pending").length,
      approved: applications.filter((application) => application.status === "approved").length,
      rejected: applications.filter((application) => application.status === "rejected").length,
    }),
    [applications]
  );

  const overviewCards = [
    {
      label: "Total Applications",
      value: String(counts.all),
      note: "All Kuppi conductor requests",
      tone: "admin-kuppi-card-blue",
    },
    {
      label: "Pending Applications",
      value: String(counts.pending),
      note: "Waiting for admin review",
      tone: "admin-kuppi-card-amber",
    },
    {
      label: "Approved Conductors",
      value: String(counts.approved),
      note: "Ready to host sessions",
      tone: "admin-kuppi-card-green",
    },
    {
      label: "Rejected Requests",
      value: String(counts.rejected),
      note: "Applications closed for now",
      tone: "admin-kuppi-card-rose",
    },
  ];

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setProcessingId(applicationId);
      await updateKuppiConductorApplicationStatus(applicationId, status);
    } catch (err) {
      alert(err.message || `Failed to ${status} application`);
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="admin-kuppi-page">
      <section className="admin-kuppi-hero">
        <div>
          <span className="admin-kuppi-eyebrow">Admin Console</span>
          <h1>Kuppi Details Management</h1>
          <p>
            Review conductor applications, monitor session activity, and keep
            student kuppi programs organized from one place.
          </p>
        </div>

        <div className="admin-kuppi-hero-actions">
          <button type="button" className="admin-kuppi-primary-btn" onClick={loadApplications}>
            Refresh Requests
          </button>
          <button type="button" className="admin-kuppi-secondary-btn">
            Live Updates Enabled
          </button>
        </div>
      </section>

      <section className="admin-kuppi-overview-grid">
        {overviewCards.map((card) => (
          <article key={card.label} className={`admin-kuppi-overview-card ${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="admin-kuppi-content-grid">
        <article className="admin-kuppi-panel">
          <div className="admin-kuppi-panel-head">
            <div>
              <h2>Conductor Applications</h2>
              <p>Requests update automatically when students submit or admins review them.</p>
            </div>
          </div>

          <div className="admin-kuppi-filter-row">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={`admin-kuppi-filter-btn ${filter === status ? "is-active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
                <span>{counts[status]}</span>
              </button>
            ))}
          </div>

          {loading && <div className="admin-kuppi-empty-state">Loading Kuppi applications...</div>}
          {error && <div className="admin-kuppi-empty-state admin-kuppi-error-state">{error}</div>}

          {!loading && !error && visibleApplications.length === 0 && (
            <div className="admin-kuppi-empty-state">No applications found for this filter.</div>
          )}

          {!loading && !error && visibleApplications.length > 0 && (
            <div className="admin-kuppi-table-wrap">
              <table className="admin-kuppi-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Subject</th>
                    <th>Module</th>
                    <th>Year</th>
                    <th>CGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.map((application) => (
                    <tr
                      key={application._id}
                      className={selectedApplication?._id === application._id ? "is-selected" : ""}
                      onClick={() => setSelectedApplicationId(application._id)}
                    >
                      <td>
                        <div className="admin-kuppi-name-cell">
                          <strong>{application.fullName}</strong>
                          <span>{new Date(application.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td>{application.mainSubject}</td>
                      <td>{application.moduleLikeToDo}</td>
                      <td>
                        {application.currentStudyYear}
                        <br />
                        <span className="admin-kuppi-muted">{application.currentSemester}</span>
                      </td>
                      <td>{application.cgpa}</td>
                      <td>
                        <span className={`admin-kuppi-status admin-kuppi-status-${application.status.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="admin-kuppi-stack">
          <article className="admin-kuppi-panel">
            <div className="admin-kuppi-panel-head">
              <div>
                <h2>Application Details</h2>
                <p>Review the selected student request before approving or rejecting it.</p>
              </div>
            </div>

            {!selectedApplication && (
              <div className="admin-kuppi-empty-state">Select an application to view its details.</div>
            )}

            {selectedApplication && (
              <div className="admin-kuppi-detail-card">
                <div className="admin-kuppi-detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>{selectedApplication.fullName}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{selectedApplication.contact}</strong>
                  </div>
                  <div>
                    <span>Main Subject</span>
                    <strong>{selectedApplication.mainSubject}</strong>
                  </div>
                  <div>
                    <span>Module</span>
                    <strong>{selectedApplication.moduleLikeToDo}</strong>
                  </div>
                  <div>
                    <span>Study Level</span>
                    <strong>
                      {selectedApplication.currentStudyYear} · {selectedApplication.currentSemester}
                    </strong>
                  </div>
                  <div>
                    <span>Availability</span>
                    <strong>{selectedApplication.availability}</strong>
                  </div>
                </div>

                <div className="admin-kuppi-detail-block">
                  <span>Topic Strength</span>
                  <p>{selectedApplication.topicStrength}</p>
                </div>

                <div className="admin-kuppi-detail-block">
                  <span>Experience / Motivation</span>
                  <p>{selectedApplication.experience}</p>
                </div>

                <div className="admin-kuppi-detail-actions">
                  <button
                    type="button"
                    className="admin-kuppi-approve-btn"
                    disabled={
                      processingId === selectedApplication._id ||
                      selectedApplication.status === "approved"
                    }
                    onClick={() => handleStatusUpdate(selectedApplication._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-kuppi-reject-btn"
                    disabled={
                      processingId === selectedApplication._id ||
                      selectedApplication.status === "rejected"
                    }
                    onClick={() => handleStatusUpdate(selectedApplication._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </article>

          <article className="admin-kuppi-panel">
            <div className="admin-kuppi-panel-head">
              <div>
                <h2>Upcoming Sessions</h2>
                <p>Quick visibility into this week&apos;s scheduled kuppis.</p>
              </div>
            </div>

            <div className="admin-kuppi-session-list">
              {scheduledSessions.map((session) => (
                <div key={session.title} className="admin-kuppi-session-card">
                  <div className="admin-kuppi-session-meta">
                    <h3>{session.title}</h3>
                    <p>{session.time}</p>
                  </div>
                  <div className="admin-kuppi-session-details">
                    <span>Conductor: {session.conductor}</span>
                    <span>{session.audience}</span>
                    <span>{session.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default AdminKuppiDetails;
