import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./AdminKuppiDetails.css";
import socket from "../../utils/socket";
import { drawEduzaLogo } from "../../utils/pdfBranding";
import {
  getKuppiConductorApplications,
  updateKuppiConductorApplicationStatus,
} from "../../utils/kuppiApi";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"];
const STATUS_CHART_ITEMS = [
  { key: "pending", label: "Pending", tone: "pending" },
  { key: "approved", label: "Approved", tone: "approved" },
  { key: "rejected", label: "Rejected", tone: "rejected" },
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
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    year: "all",
    semester: "all",
    scope: "filtered",
  });

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadApplications();
      }
    };

    const intervalId = window.setInterval(() => {
      loadApplications();
    }, 5000);

    socket.on("kuppi_application_created", handleCreated);
    socket.on("kuppi_application_updated", handleUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      socket.off("kuppi_application_created", handleCreated);
      socket.off("kuppi_application_updated", handleUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

  const uniqueYears = useMemo(
    () => ["all", ...new Set(applications.map((application) => application.currentStudyYear).filter(Boolean))],
    [applications]
  );

  const uniqueSemesters = useMemo(
    () => ["all", ...new Set(applications.map((application) => application.currentSemester).filter(Boolean))],
    [applications]
  );

  const dailyBookingData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const dayCount = applications.filter((application) => {
        const createdAt = new Date(application.createdAt);
        return (
          createdAt.getFullYear() === date.getFullYear() &&
          createdAt.getMonth() === date.getMonth() &&
          createdAt.getDate() === date.getDate()
        );
      }).length;

      return {
        key: date.toISOString(),
        label: formatter.format(date),
        fullDate: date.toLocaleDateString(),
        value: dayCount,
      };
    });
  }, [applications]);

  const maxDailyBookings = Math.max(...dailyBookingData.map((item) => item.value), 1);
  const lineChartPoints = dailyBookingData
    .map((item, index) => {
      const x = dailyBookingData.length === 1 ? 50 : (index / (dailyBookingData.length - 1)) * 100;
      const y = 100 - (item.value / maxDailyBookings) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const statusChartData = useMemo(
    () =>
      STATUS_CHART_ITEMS.map((item) => ({
        ...item,
        value: counts[item.key],
        percentage: counts.all ? Math.round((counts[item.key] / counts.all) * 100) : 0,
      })),
    [counts]
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

  const reportResults = useMemo(() => {
    const baseList = reportFilters.scope === "full" ? applications : visibleApplications;
    const query = reportFilters.name.trim().toLowerCase();

    return baseList.filter((application) => {
      const createdAt = new Date(application.createdAt);
      const matchesName = query
        ? application.fullName?.toLowerCase().includes(query)
        : true;
      const matchesYear =
        reportFilters.year === "all" || application.currentStudyYear === reportFilters.year;
      const matchesSemester =
        reportFilters.semester === "all" || application.currentSemester === reportFilters.semester;
      const matchesStart = reportFilters.startDate
        ? createdAt >= new Date(`${reportFilters.startDate}T00:00:00`)
        : true;
      const matchesEnd = reportFilters.endDate
        ? createdAt <= new Date(`${reportFilters.endDate}T23:59:59`)
        : true;

      return matchesName && matchesYear && matchesSemester && matchesStart && matchesEnd;
    });
  }, [applications, reportFilters, visibleApplications]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setProcessingId(applicationId);
      await updateKuppiConductorApplicationStatus(applicationId, status);
      await loadApplications();
    } catch (err) {
      alert(err.message || `Failed to ${status} application`);
    } finally {
      setProcessingId("");
    }
  };

  const handleReportFilterChange = (event) => {
    const { name, value } = event.target;
    setReportFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateReport = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 56;
    let tableSectionActive = false;
    const statusMap = {
      pending: { label: "Pending", color: [245, 158, 11] },
      approved: { label: "Approved", color: [22, 163, 74] },
      rejected: { label: "Rejected", color: [225, 29, 72] },
    };
    const summaryCounts = {
      total: reportResults.length,
      pending: reportResults.filter((item) => item.status === "pending").length,
      approved: reportResults.filter((item) => item.status === "approved").length,
      rejected: reportResults.filter((item) => item.status === "rejected").length,
    };

    const drawHeader = async () => {
      doc.setFillColor(255, 247, 237);
      doc.rect(0, 0, pageWidth, 92, "F");
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, 10, 92, "F");
      await drawEduzaLogo(doc, margin, 28, 46, 28);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(31, 41, 55);
      doc.text("Kuppi Applications Report", margin + 58, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin + 58, 66);
      doc.text("Clear summary of Kuppi applications for admin review", margin + 58, 80);

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 84, pageWidth - margin, 84);
      cursorY = 110;
    };

    const drawContinuationHeader = () => {
      doc.setFillColor(255, 250, 245);
      doc.rect(0, 0, pageWidth, 52, "F");
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, 8, 52, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(31, 41, 55);
      doc.text("Kuppi Applications Report", margin, 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Continued", pageWidth - margin, 30, { align: "right" });
      cursorY = 72;
    };

    const ensureSpace = (heightNeeded) => {
      if (cursorY + heightNeeded <= pageHeight - 40) {
        return;
      }

      doc.addPage();
      drawContinuationHeader();
      if (tableSectionActive) {
        drawTableHeader();
      }
    };

    const drawSectionTitle = (title, subtitle = "") => {
      ensureSpace(34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text(title, margin, cursorY);
      if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, margin, cursorY + 14);
      }
      cursorY += 24;
    };

    const drawFilterSummary = () => {
      const filters = [
        `Name: ${reportFilters.name || "All"}`,
        `Date From: ${reportFilters.startDate || "Any"}`,
        `Date To: ${reportFilters.endDate || "Any"}`,
        `Year: ${reportFilters.year === "all" ? "All" : reportFilters.year}`,
        `Semester: ${reportFilters.semester === "all" ? "All" : reportFilters.semester}`,
      ];

      drawSectionTitle("Filters");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      filters.forEach((item) => {
        doc.text(item, margin, cursorY);
        cursorY += 14;
      });
      cursorY += 6;
    };

    const drawSummaryCards = () => {
      drawSectionTitle("Summary");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      const lines = [
        `Total applications: ${summaryCounts.total}`,
        `Pending: ${summaryCounts.pending}`,
        `Approved: ${summaryCounts.approved}`,
        `Rejected: ${summaryCounts.rejected}`,
      ];
      lines.forEach((line) => {
        doc.text(line, margin, cursorY);
        cursorY += 16;
      });
      cursorY += 4;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        summaryCounts.total === 0
          ? "No applications matched the selected filters."
          : `${summaryCounts.approved} approved, ${summaryCounts.pending} pending, and ${summaryCounts.rejected} rejected applications are included in this report.`,
        margin,
        cursorY
      );
      cursorY += 4;
    };

    const drawCharts = () => {
      drawSectionTitle("Charts");
      ensureSpace(190);

      const leftX = margin;
      const rightX = margin + contentWidth / 2 + 12;
      const chartWidth = contentWidth / 2 - 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text("Daily bookings", leftX, cursorY);
      doc.text("Status breakdown", rightX, cursorY);

      const chartBaseX = leftX;
      const chartBaseY = cursorY + 120;
      const chartInnerWidth = chartWidth - 20;
      const chartInnerHeight = 80;
      const maxValue = Math.max(...dailyBookingData.map((item) => item.value), 1);

      doc.setDrawColor(226, 232, 240);
      for (let i = 0; i <= 4; i += 1) {
        const y = chartBaseY - (chartInnerHeight / 4) * i;
        doc.line(chartBaseX, y, chartBaseX + chartInnerWidth, y);
      }

      doc.setDrawColor(234, 88, 12);
      let previousPoint = null;
      dailyBookingData.forEach((item, index) => {
        const x = chartBaseX + (chartInnerWidth / Math.max(dailyBookingData.length - 1, 1)) * index;
        const y = chartBaseY - (item.value / maxValue) * chartInnerHeight;
        if (previousPoint) {
          doc.line(previousPoint.x, previousPoint.y, x, y);
        }
        doc.setFillColor(234, 88, 12);
        doc.circle(x, y, 3, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, x, chartBaseY + 16, { align: "center" });
        previousPoint = { x, y };
      });

      const breakdown = [
        { label: "Pending", value: summaryCounts.pending, color: [245, 158, 11] },
        { label: "Approved", value: summaryCounts.approved, color: [22, 163, 74] },
        { label: "Rejected", value: summaryCounts.rejected, color: [225, 29, 72] },
      ];
      const total = Math.max(summaryCounts.total, 1);
      breakdown.forEach((item, index) => {
        const rowY = cursorY + 26 + index * 34;
        const percentage = Math.round((item.value / total) * 100);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(item.label, rightX, rowY);
        doc.text(`${item.value} (${percentage}%)`, rightX + chartWidth - 10, rowY, { align: "right" });
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(rightX, rowY + 10, chartWidth - 10, 8, 999, 999, "F");
        doc.setFillColor(...item.color);
        doc.roundedRect(
          rightX,
          rowY + 10,
          Math.max(((chartWidth - 10) * percentage) / 100, item.value > 0 ? 10 : 0),
          8,
          999,
          999,
          "F"
        );
      });

      cursorY += 154;
    };

    const drawTableHeader = () => {
      ensureSpace(34);
      tableSectionActive = true;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, cursorY, contentWidth, 24, 6, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text("Applicant", margin + 10, cursorY + 16);
      doc.text("Academic", margin + 170, cursorY + 16);
      doc.text("Status", margin + 300, cursorY + 16);
      doc.text("Submitted", margin + 390, cursorY + 16);
      cursorY += 32;
    };

    const drawApplicationRow = (application, index) => {
      ensureSpace(56);

      const rowHeight = 48;
      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
      doc.roundedRect(margin, cursorY - 4, contentWidth, rowHeight, 6, 6, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(application.fullName || "N/A", margin + 10, cursorY + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(doc.splitTextToSize(`${application.mainSubject} | ${application.moduleLikeToDo}`, 150), margin + 10, cursorY + 24);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(
        doc.splitTextToSize(`${application.currentStudyYear} / ${application.currentSemester}`, 110),
        margin + 170,
        cursorY + 18
      );

      const statusCfg = statusMap[application.status] || statusMap.pending;
      doc.setFillColor(...statusCfg.color);
      doc.roundedRect(margin + 300, cursorY + 2, 72, 18, 999, 999, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(statusCfg.label, margin + 336, cursorY + 14, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(
        doc.splitTextToSize(new Date(application.createdAt).toLocaleString(), 120),
        margin + 390,
        cursorY + 18
      );

      cursorY += 56;
    };

    await drawHeader();
    drawFilterSummary();
    drawSummaryCards();
    drawCharts();
    drawSectionTitle("Application Records");

    if (reportResults.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text("No Kuppi applications matched the selected filters.", margin, cursorY);
    } else {
      drawTableHeader();
      reportResults.forEach((application, index) => {
        drawApplicationRow(application, index);
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      doc.setPage(pageNumber);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("EDUZA Kuppi Report", margin, pageHeight - 18);
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 18, {
        align: "right",
      });
    }

    const mode = reportFilters.scope === "full" ? "full" : "filtered";
    doc.save(`kuppi-report-${mode}-${new Date().toISOString().slice(0, 10)}.pdf`);
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
          <button
            type="button"
            className="admin-kuppi-secondary-btn"
            onClick={() => setReportModalOpen(true)}
          >
            Generate Report
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

      <section className="admin-kuppi-analytics-grid">
        <article className="admin-kuppi-panel">
          <div className="admin-kuppi-panel-head">
            <div>
              <h2>Daily Kuppi Bookings</h2>
              <p>How many Kuppi requests were submitted each day during the last 7 days.</p>
            </div>
          </div>

          <div className="admin-kuppi-line-chart-card">
            <div className="admin-kuppi-line-chart">
              <div className="admin-kuppi-line-grid"></div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="admin-kuppi-line-svg" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="url(#kuppiLineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={lineChartPoints}
                />
                <defs>
                  <linearGradient id="kuppiLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fdba74" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>

              {dailyBookingData.map((item, index) => {
                const x = dailyBookingData.length === 1 ? 50 : (index / (dailyBookingData.length - 1)) * 100;
                const y = 100 - (item.value / maxDailyBookings) * 100;

                return (
                  <div
                    key={item.key}
                    className="admin-kuppi-line-point"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`${item.fullDate}: ${item.value} bookings`}
                  >
                    <span className="admin-kuppi-line-point-value">{item.value}</span>
                  </div>
                );
              })}
            </div>

            <div className="admin-kuppi-line-labels">
              {dailyBookingData.map((item) => (
                <div key={item.key} className="admin-kuppi-line-label">
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-kuppi-panel">
          <div className="admin-kuppi-panel-head">
            <div>
              <h2>Status Overview</h2>
              <p>Approved, rejected, and pending Kuppi requests based on the live admin dataset.</p>
            </div>
          </div>

          <div className="admin-kuppi-status-chart">
            {statusChartData.map((item) => (
              <div key={item.key} className="admin-kuppi-status-row">
                <div className="admin-kuppi-status-copy">
                  <span className={`admin-kuppi-status-dot admin-kuppi-status-dot-${item.tone}`}></span>
                  <strong>{item.label}</strong>
                </div>
                <div className="admin-kuppi-status-metrics">
                  <span>{item.value}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="admin-kuppi-status-track">
                  <div
                    className={`admin-kuppi-status-fill admin-kuppi-status-fill-${item.tone}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
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

      {reportModalOpen && (
        <div className="admin-kuppi-modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="admin-kuppi-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-kuppi-panel-head">
              <div>
                <h2>Generate Kuppi Report</h2>
                <p>Filter by date, name, year, semester, or export the full report.</p>
              </div>
              <button
                type="button"
                className="admin-kuppi-modal-close"
                onClick={() => setReportModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-kuppi-report-grid">
              <div className="admin-kuppi-field">
                <label>Report Scope</label>
                <select name="scope" value={reportFilters.scope} onChange={handleReportFilterChange}>
                  <option value="filtered">Current Filtered Report</option>
                  <option value="full">Full Report</option>
                </select>
              </div>

              <div className="admin-kuppi-field">
                <label>Name Wise</label>
                <input
                  type="text"
                  name="name"
                  value={reportFilters.name}
                  onChange={handleReportFilterChange}
                  placeholder="Search student name"
                />
              </div>

              <div className="admin-kuppi-field">
                <label>Date From</label>
                <input
                  type="date"
                  name="startDate"
                  value={reportFilters.startDate}
                  onChange={handleReportFilterChange}
                />
              </div>

              <div className="admin-kuppi-field">
                <label>Date To</label>
                <input
                  type="date"
                  name="endDate"
                  value={reportFilters.endDate}
                  onChange={handleReportFilterChange}
                />
              </div>

              <div className="admin-kuppi-field">
                <label>Year Wise</label>
                <select name="year" value={reportFilters.year} onChange={handleReportFilterChange}>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year === "all" ? "All Years" : year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-kuppi-field">
                <label>Semester Wise</label>
                <select
                  name="semester"
                  value={reportFilters.semester}
                  onChange={handleReportFilterChange}
                >
                  {uniqueSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester === "all" ? "All Semesters" : semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-kuppi-report-summary">
              <strong>{reportResults.length}</strong>
              <span>records match the current report filters</span>
            </div>

            <div className="admin-kuppi-detail-actions">
              <button type="button" className="admin-kuppi-secondary-report-btn" onClick={() => setReportModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="admin-kuppi-primary-report-btn" onClick={generateReport}>
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKuppiDetails;
