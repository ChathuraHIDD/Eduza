import React, { useMemo, useState } from "react";
import "./KuppiSessions.css";
import { submitKuppiConductorApplication } from "../../utils/kuppiApi";

function KuppiSessions() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const currentUser = {
    name: storedUser.name || storedUser.fullName || storedUser.username || "Saumya",
    year: storedUser.year || "3rd Year",
    semester: storedUser.semester || "Semester 1",
  };

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinnedTasks, setPinnedTasks] = useState([1, 5, 7]);
  const [notifyTasks, setNotifyTasks] = useState([]);

  const monthNames = [
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

  const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentMonthName = monthNames[currentCalendarDate.getMonth()];
  const currentYearValue = currentCalendarDate.getFullYear();

  const allTasks = [
    {
      id: 1,
      title: "UI Design Kuppi",
      time: "10:00 AM - 11:30 AM",
      day: "Monday",
      date: 3,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "UI/UX",
      year: "3rd Year",
      semester: "Semester 1",
      type: "today",
      category: "UI Planning",
      bgClass: "task-card-cyan",
      avatars: ["S", "A", "K"],
      accent: "accent-cyan",
      conductor: "Nethmi",
      calendarColor: "calendar-cyan",
    },
    {
      id: 2,
      title: "Web Development Kuppi",
      time: "01:00 PM - 02:30 PM",
      day: "Wednesday",
      date: 5,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Web Development",
      year: "3rd Year",
      semester: "Semester 1",
      type: "today",
      category: "Frontend Sync",
      bgClass: "task-card-peach",
      avatars: ["D", "R", "M"],
      accent: "accent-peach",
      conductor: "Kasuni",
      calendarColor: "calendar-orange",
    },
    {
      id: 3,
      title: "Software Engineering Discussion",
      time: "09:00 AM - 10:00 AM",
      day: "Saturday",
      date: 8,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Software Engineering",
      year: "3rd Year",
      semester: "Semester 1",
      type: "today",
      category: "Concept Review",
      bgClass: "task-card-pink",
      avatars: ["J", "N", "T"],
      accent: "accent-pink",
      conductor: "Tharushi",
      calendarColor: "calendar-pink",
    },
    {
      id: 4,
      title: "Database Systems Kuppi",
      time: "11:00 AM - 12:00 PM",
      day: "Tuesday",
      date: 11,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Database",
      year: "2nd Year",
      semester: "Semester 2",
      type: "today",
      category: "Theory Help",
      bgClass: "task-card-white",
      avatars: ["L", "P", "Y"],
      accent: "accent-white",
      conductor: "Raveen",
      calendarColor: "calendar-slate",
    },
    {
      id: 5,
      title: "Networking Revision",
      time: "02:00 PM - 03:30 PM",
      day: "Friday",
      date: 14,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Networking",
      year: "2nd Year",
      semester: "Semester 2",
      type: "upcoming",
      category: "Revision",
      bgClass: "task-card-lavender",
      avatars: ["S", "A", "K"],
      accent: "accent-lavender",
      conductor: "Dinuki",
      calendarColor: "calendar-purple",
    },
    {
      id: 6,
      title: "Java Programming Kuppi",
      time: "10:00 AM - 11:30 AM",
      day: "Tuesday",
      date: 18,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Programming",
      year: "1st Year",
      semester: "Semester 2",
      type: "upcoming",
      category: "Code Practice",
      bgClass: "task-card-yellow",
      avatars: ["F", "R", "C"],
      accent: "accent-yellow",
      conductor: "Sachini",
      calendarColor: "calendar-yellow",
    },
    {
      id: 7,
      title: "Algorithms Kuppi",
      time: "03:00 PM - 04:30 PM",
      day: "Tuesday",
      date: 18,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Algorithms",
      year: "3rd Year",
      semester: "Semester 1",
      type: "upcoming",
      category: "Problem Solving",
      bgClass: "task-card-cyan",
      avatars: ["P", "S", "L"],
      accent: "accent-cyan",
      conductor: "Malmi",
      calendarColor: "calendar-cyan",
    },
    {
      id: 8,
      title: "Mobile App Kuppi",
      time: "04:00 PM - 05:00 PM",
      day: "Saturday",
      date: 22,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Mobile Development",
      year: "3rd Year",
      semester: "Semester 1",
      type: "upcoming",
      category: "App Build",
      bgClass: "task-card-peach",
      avatars: ["R", "T", "S"],
      accent: "accent-peach",
      conductor: "Saumya",
      calendarColor: "calendar-orange",
    },
    {
      id: 9,
      title: "React Revision",
      time: "06:00 PM - 07:00 PM",
      day: "Tuesday",
      date: 18,
      month: currentMonthName,
      yearNumber: currentYearValue,
      subject: "Web Development",
      year: "3rd Year",
      semester: "Semester 1",
      type: "upcoming",
      category: "Revision",
      bgClass: "task-card-lavender",
      avatars: ["A", "B", "C"],
      accent: "accent-lavender",
      conductor: "Nipuni",
      calendarColor: "calendar-purple",
    },
  ];

  const [filters, setFilters] = useState({
    day: "All",
    subject: "All",
    year: "All",
    semester: "All",
  });

  const [conductorForm, setConductorForm] = useState({
    fullName: currentUser.name,
    mainSubject: "",
    moduleLikeToDo: "",
    currentStudyYear: currentUser.year,
    currentSemester: currentUser.semester,
    cgpa: "",
    contact: "",
    experience: "",
    topicStrength: "",
    availability: "",
  });

  const uniqueSubjects = ["All", ...new Set(allTasks.map((task) => task.subject))];
  const uniqueYears = ["All", ...new Set(allTasks.map((task) => task.year))];
  const uniqueSemesters = ["All", ...new Set(allTasks.map((task) => task.semester))];
  const uniqueDays = ["All", ...new Set(allTasks.map((task) => task.day))];

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchDay = filters.day === "All" || task.day === filters.day;
      const matchSubject = filters.subject === "All" || task.subject === filters.subject;
      const matchYear = filters.year === "All" || task.year === filters.year;
      const matchSemester =
        filters.semester === "All" || task.semester === filters.semester;

      const matchSelectedDate =
        !selectedDate ||
        (task.date === selectedDate &&
          task.month === currentMonthName &&
          task.yearNumber === currentYearValue);

      return (
        matchDay &&
        matchSubject &&
        matchYear &&
        matchSemester &&
        matchSelectedDate
      );
    });
  }, [allTasks, filters, selectedDate, currentMonthName, currentYearValue]);

  const sortedFilteredTasks = useMemo(() => {
    const pinned = filteredTasks.filter((task) => pinnedTasks.includes(task.id));
    const unpinned = filteredTasks.filter((task) => !pinnedTasks.includes(task.id));
    return [...pinned, ...unpinned];
  }, [filteredTasks, pinnedTasks]);

  const todayTasks = sortedFilteredTasks.filter((task) => task.type === "today");
  const upcomingTasks = sortedFilteredTasks.filter((task) => task.type === "upcoming");

  const hoveredDateTasks = hoveredDate
    ? allTasks.filter(
        (task) =>
          task.date === hoveredDate &&
          task.month === currentMonthName &&
          task.yearNumber === currentYearValue
      )
    : [];

  const calendarDays = useMemo(() => {
    const year = currentYearValue;
    const monthIndex = currentCalendarDate.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const pinnedMeetings = allTasks.filter(
        (task) =>
          task.date === d &&
          task.month === currentMonthName &&
          task.yearNumber === currentYearValue &&
          pinnedTasks.includes(task.id)
      );

      const allMeetings = allTasks.filter(
        (task) =>
          task.date === d &&
          task.month === currentMonthName &&
          task.yearNumber === currentYearValue
      );

      days.push({
        type: "day",
        date: d,
        key: `day-${d}`,
        pinnedMeetings,
        allMeetings,
      });
    }

    return days;
  }, [allTasks, pinnedTasks, currentCalendarDate, currentMonthName, currentYearValue]);

  const handlePrevMonth = () => {
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setSelectedDate(null);
    setHoveredDate(null);
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
    setSelectedDate(null);
    setHoveredDate(null);
  };

  const handleCalendarDateClick = (date) => {
    setSelectedDate((prev) => (prev === date ? null : date));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setConductorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConductorSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedRequest = await submitKuppiConductorApplication({
        ...conductorForm,
        userId: storedUser._id || storedUser.id || null,
      });
      console.log("Conductor Application Data:", savedRequest);
      alert("Kuppi conductor request sent to admin successfully!");
      setIsModalOpen(false);
      setConductorForm({
        fullName: currentUser.name,
        mainSubject: "",
        moduleLikeToDo: "",
        currentStudyYear: currentUser.year,
        currentSemester: currentUser.semester,
        cgpa: "",
        contact: "",
        experience: "",
        topicStrength: "",
        availability: "",
      });
    } catch (error) {
      alert(error.message || "Failed to send Kuppi conductor request.");
    }
  };

  const handlePinTask = (taskId) => {
    setPinnedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
    setOpenMenuId(null);
  };

  const handleNotifyTask = (task) => {
    if (notifyTasks.includes(task.id)) {
      alert(`Reminder already set for "${task.title}" 2 hours before.`);
    } else {
      setNotifyTasks((prev) => [...prev, task.id]);
      alert(`You will be notified 2 hours before "${task.title}".`);
    }
    setOpenMenuId(null);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const TaskCard = ({ task }) => {
    const isPinned = pinnedTasks.includes(task.id);
    const isNotifyEnabled = notifyTasks.includes(task.id);

    return (
      <div className={`kuppi-task-card ${task.bgClass}`}>
        <div className="task-shape task-shape-one"></div>
        <div className="task-shape task-shape-two"></div>

        <div className="kuppi-task-top">
          <div>
            <div className="task-top-badges">
              <span className={`task-chip ${task.accent}`}>{task.category}</span>
              {isPinned && <span className="small-status-badge pinned-badge">📌 Pinned</span>}
              {isNotifyEnabled && (
                <span className="small-status-badge notify-badge">🔔 2h Before</span>
              )}
            </div>

            <h3>{task.title}</h3>
            <p>{task.time}</p>
            <small className="task-meta-line">
              {task.subject} • {task.day} • {task.year}
            </small>
          </div>

          <div className="task-menu-wrapper">
            <button
              className="task-menu-btn"
              onClick={() =>
                setOpenMenuId((prev) => (prev === task.id ? null : task.id))
              }
            >
              ⋮
            </button>

            {openMenuId === task.id && (
              <div className="task-dropdown-menu">
                <button onClick={() => handlePinTask(task.id)}>
                  {isPinned ? "Unpin this" : "Pin this"}
                </button>
                <button onClick={() => handleNotifyTask(task)}>
                  {isNotifyEnabled ? "Reminder Added" : "Notify me"}
                  <span className="menu-subtext">2h before kuppi</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="kuppi-task-bottom">
          <div>
            <div className="kuppi-avatars">
              {task.avatars.map((avatar, index) => (
                <div
                  key={index}
                  className="kuppi-avatar"
                  style={{ marginLeft: index === 0 ? "0" : "-10px" }}
                >
                  {avatar}
                </div>
              ))}
            </div>
            <div className="conductor-text">Conductor: {task.conductor}</div>
          </div>

          <div className="kuppi-actions">
            <button className="task-action-btn">📞</button>
            <button className="task-action-btn">🎥</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="kuppi-page">
      <div className="kuppi-header-card">
        <div className="kuppi-header-circle kuppi-header-circle-one"></div>
        <div className="kuppi-header-circle kuppi-header-circle-two"></div>

        <div className="kuppi-badge">
          <span className="kuppi-badge-icon">📚</span>
          <span>Study Together</span>
        </div>

        <h1>Kuppi Sessions</h1>
        <p>
          Join collaborative kuppi sessions, share knowledge with friends, and
          learn difficult topics together in a smart and engaging way.
        </p>
      </div>

      <div className="kuppi-layout">
        <div className="kuppi-main-panel">
          <section className="kuppi-section">
            <div className="section-head">
              <div>
                <h2 className="kuppi-section-title">Find Your Kuppi</h2>
                <p className="section-subtitle">
                  Filter sessions by day, subject, year, and semester.
                </p>
              </div>

              <button className="join-conductor-btn" onClick={() => setIsModalOpen(true)}>
                Join as a Kuppi Conductor
              </button>
            </div>

            <div className="filters-card">
              <div className="filter-group">
                <label>Day</label>
                <select name="day" value={filters.day} onChange={handleFilterChange}>
                  {uniqueDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                >
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Year</label>
                <select name="year" value={filters.year} onChange={handleFilterChange}>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                >
                  {uniqueSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDate && (
              <div className="selected-date-banner">
                <span>
                  Showing sessions for {currentMonthName} {selectedDate}, {currentYearValue}
                </span>
                <button onClick={clearDateFilter}>Clear</button>
              </div>
            )}
          </section>

          <section className="kuppi-section">
            <div className="section-head">
              <div>
                <h2 className="kuppi-section-title">Today's Task</h2>
                <p className="section-subtitle">
                  Sessions matching your selected filters.
                </p>
              </div>
            </div>

            <div className="kuppi-grid">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <div className="empty-state-card">
                  No sessions found for selected filters.
                </div>
              )}
            </div>
          </section>

          <section className="kuppi-section">
            <div className="section-head">
              <div>
                <h2 className="kuppi-section-title">Upcoming</h2>
                <p className="section-subtitle">
                  Plan ahead and join future kuppi sessions.
                </p>
              </div>
            </div>

            <div className="upcoming-highlight">
              <div className="highlight-text">
                <span className="highlight-badge">Next Session</span>
                <h3>Weekly Team Kuppi</h3>
                <p>
                  Revise difficult lessons together, discuss doubts, and share
                  notes with your study circle.
                </p>
                <button className="join-now-btn">Join Session</button>
              </div>

              <div className="rocket-visual">🚀</div>
            </div>

            <div className="kuppi-grid upcoming-grid">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <div className="empty-state-card">
                  No upcoming sessions found for selected filters.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="kuppi-side-panel">
          <div className="side-card calendar-card">
            <div className="calendar-head enhanced-calendar-head">
              <button className="calendar-nav-btn" onClick={handlePrevMonth}>
                ‹
              </button>
              <h4>
                {currentMonthName} {currentYearValue}
              </h4>
              <button className="calendar-nav-btn" onClick={handleNextMonth}>
                ›
              </button>
            </div>

            <div className="calendar-weekdays">
              {weekNames.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>

            <div className="full-calendar-grid">
              {calendarDays.map((item) =>
                item.type === "empty" ? (
                  <div key={item.key} className="calendar-cell empty-cell"></div>
                ) : (
                  <div
                    key={item.key}
                    className={`calendar-cell ${
                      hoveredDate === item.date ? "active" : ""
                    } ${selectedDate === item.date ? "selected" : ""}`}
                    onMouseEnter={() => setHoveredDate(item.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => handleCalendarDateClick(item.date)}
                  >
                    <div className="calendar-cell-top">
                      <div className="calendar-cell-number">{item.date}</div>
                      {item.pinnedMeetings.length > 3 && (
                        <span className="calendar-more-count">
                          +{item.pinnedMeetings.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="calendar-dots">
                      {item.pinnedMeetings.slice(0, 3).map((meeting) => (
                        <span
                          key={meeting.id}
                          className={`calendar-dot ${meeting.calendarColor}`}
                          title={meeting.title}
                        ></span>
                      ))}
                    </div>

                    {hoveredDate === item.date && item.allMeetings.length > 0 && (
                      <div className="calendar-tooltip">
                        {item.allMeetings.slice(0, 2).map((meeting) => (
                          <div key={meeting.id} className="calendar-tooltip-item">
                            <span
                              className={`calendar-dot ${meeting.calendarColor}`}
                            ></span>
                            <div>
                              <strong>{meeting.title}</strong>
                              <small>{meeting.time}</small>
                            </div>
                          </div>
                        ))}
                        {item.allMeetings.length > 2 && (
                          <div className="calendar-tooltip-more">
                            +{item.allMeetings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="calendar-legend">
              <div><span className="calendar-dot calendar-cyan"></span> UI / Problem Solving</div>
              <div><span className="calendar-dot calendar-orange"></span> Web / App</div>
              <div><span className="calendar-dot calendar-pink"></span> SE Discussion</div>
              <div><span className="calendar-dot calendar-purple"></span> Revision</div>
              <div><span className="calendar-dot calendar-yellow"></span> Code Practice</div>
              <div><span className="calendar-dot calendar-slate"></span> Theory Help</div>
            </div>

            <div className="calendar-hover-box">
              {hoveredDate ? (
                hoveredDateTasks.length > 0 ? (
                  <>
                    <h5>
                      Sessions on {currentMonthName} {hoveredDate}
                    </h5>
                    <ul>
                      {hoveredDateTasks.map((task) => (
                        <li key={task.id}>
                          <strong>{task.title}</strong>
                          <span>{task.time}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="no-calendar-task">No sessions for this day</div>
                )
              ) : (
                <div className="no-calendar-task">
                  Hover a date to preview sessions. Click a date to filter.
                </div>
              )}
            </div>
          </div>

          <div className="side-card summary-card">
            <span className="side-card-label">Filtered Result</span>
            <h3>{filteredTasks.length} Sessions Found</h3>
            <p>
              Based on your selected day, subject, year, semester, and date filter.
            </p>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Join as a Kuppi Conductor</h3>
                <p>Fill in your details to become a session conductor.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form className="conductor-form" onSubmit={handleConductorSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={conductorForm.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Main Subject</label>
                  <input
                    type="text"
                    name="mainSubject"
                    value={conductorForm.mainSubject}
                    onChange={handleFormChange}
                    placeholder="Ex: Web Development"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Module You Like to Conduct</label>
                  <input
                    type="text"
                    name="moduleLikeToDo"
                    value={conductorForm.moduleLikeToDo}
                    onChange={handleFormChange}
                    placeholder="Ex: SE3040 / Database Systems"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Study Year</label>
                  <select
                    name="currentStudyYear"
                    value={conductorForm.currentStudyYear}
                    onChange={handleFormChange}
                    required
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Semester</label>
                  <select
                    name="currentSemester"
                    value={conductorForm.currentSemester}
                    onChange={handleFormChange}
                    required
                  >
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current CGPA</label>
                  <input
                    type="number"
                    name="cgpa"
                    value={conductorForm.cgpa}
                    onChange={handleFormChange}
                    placeholder="Ex: 3.45"
                    min="0"
                    max="4"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={conductorForm.contact}
                    onChange={handleFormChange}
                    placeholder="07xxxxxxxx"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={conductorForm.availability}
                    onChange={handleFormChange}
                    placeholder="Ex: Mon / Wed evenings"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Topic Strength</label>
                <input
                  type="text"
                  name="topicStrength"
                  value={conductorForm.topicStrength}
                  onChange={handleFormChange}
                  placeholder="Ex: React, Java, DBMS"
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience / Why do you want to be a conductor?</label>
                <textarea
                  name="experience"
                  value={conductorForm.experience}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Write a short explanation..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KuppiSessions;
