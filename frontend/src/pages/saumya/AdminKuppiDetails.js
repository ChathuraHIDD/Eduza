import React from "react";
import "./AdminKuppiDetails.css";

const overviewCards = [
  {
    label: "Total Sessions",
    value: "24",
    note: "Across all study years",
    tone: "admin-kuppi-card-blue",
  },
  {
    label: "Pending Applications",
    value: "06",
    note: "Waiting for review",
    tone: "admin-kuppi-card-amber",
  },
  {
    label: "Approved Conductors",
    value: "18",
    note: "Active this month",
    tone: "admin-kuppi-card-green",
  },
  {
    label: "Upcoming This Week",
    value: "09",
    note: "Sessions already scheduled",
    tone: "admin-kuppi-card-rose",
  },
];

const conductorApplications = [
  {
    id: "APP-104",
    name: "Nethmi Perera",
    subject: "UI / UX",
    module: "IT3040 Human Computer Interaction",
    year: "3rd Year",
    semester: "Semester 1",
    cgpa: "3.72",
    availability: "Mon, Wed evenings",
    status: "Pending",
  },
  {
    id: "APP-105",
    name: "Raveen Silva",
    subject: "Database",
    module: "SE3020 Database Systems",
    year: "2nd Year",
    semester: "Semester 2",
    cgpa: "3.54",
    availability: "Tue afternoons",
    status: "Pending",
  },
  {
    id: "APP-106",
    name: "Sachini Fernando",
    subject: "Programming",
    module: "IT2120 Object Oriented Concepts",
    year: "1st Year",
    semester: "Semester 2",
    cgpa: "3.80",
    availability: "Fri mornings",
    status: "Reviewing",
  },
];

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
          <button type="button" className="admin-kuppi-primary-btn">
            Review Applications
          </button>
          <button type="button" className="admin-kuppi-secondary-btn">
            Export Summary
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
              <p>Applications submitted by students to host kuppi sessions.</p>
            </div>
            <button type="button" className="admin-kuppi-text-btn">
              View All
            </button>
          </div>

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
                {conductorApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <div className="admin-kuppi-name-cell">
                        <strong>{application.name}</strong>
                        <span>{application.id}</span>
                      </div>
                    </td>
                    <td>{application.subject}</td>
                    <td>{application.module}</td>
                    <td>
                      {application.year}
                      <br />
                      <span className="admin-kuppi-muted">{application.semester}</span>
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
        </article>

        <aside className="admin-kuppi-stack">
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

          <article className="admin-kuppi-panel">
            <div className="admin-kuppi-panel-head">
              <div>
                <h2>Admin Notes</h2>
                <p>Suggested actions for smoother session coordination.</p>
              </div>
            </div>

            <ul className="admin-kuppi-note-list">
              <li>Prioritize pending applications from upcoming exam modules.</li>
              <li>Verify conductor availability before approving overlapping sessions.</li>
              <li>Share approved kuppi schedules with students at least 24 hours early.</li>
            </ul>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default AdminKuppiDetails;
