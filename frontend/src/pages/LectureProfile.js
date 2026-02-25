import { useEffect, useMemo, useState } from "react";
import StopwatchCard from "../components/study/StopwatchCard";

const lecturers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Associate Professor",
    department: "Computer Science",
    specialty: "Web Technologies & Full-Stack Development",
    initials: "SC",
    color: "#f97316",
    rating: 4.8,
    students: 342,
    courses: 3,
    email: "s.chen@eduza.ac",
    office: "Block A, Room 214",
    hours: "Mon & Wed 2–4 PM",
    bio:
      "Dr. Chen is a leading researcher in modern web technologies with over 12 years of industry and academic experience. She has published 30+ peer-reviewed papers and leads the university's Web Innovation Lab.",
    coursesList: [
      { name: "Advanced Web Development", code: "CS401", students: 145, rating: 4.9 },
      { name: "Full-Stack Engineering", code: "CS312", students: 112, rating: 4.7 },
      { name: "JavaScript Frameworks", code: "CS210", students: 85, rating: 4.8 },
    ],
    tags: ["Web Dev", "React", "Node.js", "APIs"],
  },
  {
    id: 2,
    name: "Prof. Mark Williams",
    title: "Professor",
    department: "Computer Science",
    specialty: "Algorithms & Theoretical Computer Science",
    initials: "MW",
    color: "#3b82f6",
    rating: 4.6,
    students: 278,
    courses: 2,
    email: "m.williams@eduza.ac",
    office: "Block B, Room 108",
    hours: "Tue & Thu 10 AM–12 PM",
    bio:
      'Prof. Williams is a world-renowned algorithmist and author of the textbook "Algorithmic Thinking" used in over 200 universities. His research focuses on computational complexity and optimization.',
    coursesList: [
      { name: "Data Structures & Algorithms", code: "CS201", students: 189, rating: 4.6 },
      { name: "Computational Theory", code: "CS304", students: 89, rating: 4.5 },
    ],
    tags: ["Algorithms", "DSA", "Complexity", "Python"],
  },
  {
    id: 3,
    name: "Ms. Anya Patel",
    title: "Senior Lecturer",
    department: "Design & Technology",
    specialty: "User Experience & Interface Design",
    initials: "AP",
    color: "#22c55e",
    rating: 4.9,
    students: 215,
    courses: 2,
    email: "a.patel@eduza.ac",
    office: "Block C, Studio 3",
    hours: "Mon, Wed & Fri 1–3 PM",
    bio:
      "Ms. Patel brings a unique blend of industry design leadership and academic excellence. She previously led design teams at top tech companies and brings real-world UX methodology into every class.",
    coursesList: [
      { name: "UI/UX Design Principles", code: "DT201", students: 130, rating: 4.9 },
      { name: "Design Systems", code: "DT310", students: 85, rating: 4.9 },
    ],
    tags: ["UX", "Figma", "Prototyping", "Research"],
  },
  {
    id: 4,
    name: "Dr. James Lee",
    title: "Assistant Professor",
    department: "Cloud & Systems",
    specialty: "Distributed Systems & Cloud Architecture",
    initials: "JL",
    color: "#a855f7",
    rating: 4.5,
    students: 196,
    courses: 2,
    email: "j.lee@eduza.ac",
    office: "Block D, Room 305",
    hours: "Wed & Fri 3–5 PM",
    bio:
      "Dr. Lee specializes in cloud-native architectures and distributed computing systems. With certifications from all major cloud providers, he bridges the gap between theoretical knowledge and industry practice.",
    coursesList: [
      { name: "Cloud Computing Fundamentals", code: "CS320", students: 124, rating: 4.5 },
      { name: "DevOps & CI/CD", code: "CS410", students: 72, rating: 4.6 },
    ],
    tags: ["AWS", "Docker", "Kubernetes", "DevOps"],
  },
];

function StarRating({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#f97316" : "none"}
          stroke={s <= Math.round(value) ? "#f97316" : "#444"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316", marginLeft: 2 }}>
        {value}
      </span>
    </div>
  );
}

function LectureProfile() {
  const [selected, setSelected] = useState(lecturers[0]);
  const [selectedCourse, setSelectedCourse] = useState(lecturers[0].coursesList[0]);

  // TODO: replace with real logged in user id later
  const userId = "u1";

  // When lecturer changes, default-select first course
  useEffect(() => {
    setSelectedCourse(selected?.coursesList?.[0] || null);
  }, [selected]);

  // Names we store into DB (simple + consistent)
  const lecturerModuleName = useMemo(() => `Lecturer: ${selected.name}`, [selected]);
  const courseModuleName = useMemo(() => {
    if (!selectedCourse) return `Course: ${selected.name}`;
    return `Course: ${selectedCourse.name} (${selectedCourse.code})`;
  }, [selectedCourse, selected]);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      {/* Lecturers list */}
      <div>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>
          Your Lecturers
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {lecturers.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: selected.id === l.id ? "#1e1e1e" : "#1a1a1a",
                border: selected.id === l.id ? `1px solid ${l.color}44` : "1px solid #242424",
                borderLeft: selected.id === l.id ? `3px solid ${l.color}` : "3px solid transparent",
                borderRadius: 12,
                padding: "10px 12px",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${l.color}, ${l.color}88)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {l.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0", marginBottom: 2 }}>
                  {l.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lecturer detail */}
      <div>
        {/* Header */}
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #242424",
            borderRadius: 18,
            padding: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                flexShrink: 0,
                background: `linear-gradient(135deg, ${selected.color}, ${selected.color}88)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                boxShadow: `0 0 30px ${selected.color}33`,
              }}
            >
              {selected.initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: "0 0 4px",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#f5f5f5",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {selected.name}
                  </h2>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: "#777" }}>
                    {selected.title} · {selected.department}
                  </p>
                  <StarRating value={selected.rating} />
                </div>
                <button
                  style={{
                    background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    padding: "8px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Contact
                </button>
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 13, color: "#888", lineHeight: 1.7 }}>
                {selected.specialty}
              </p>

              <div style={{ display: "flex", gap: "6px", marginTop: 10, flexWrap: "wrap" }}>
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: `${selected.color}18`,
                      color: selected.color,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              marginTop: "1.5rem",
              background: "#242424",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {[
              { label: "Rating", value: selected.rating },
              { label: "Students", value: selected.students },
              { label: "Courses", value: selected.courses },
            ].map((s) => (
              <div key={s.label} style={{ background: "#1e1e1e", padding: "0.9rem", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: selected.color, letterSpacing: "-0.5px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ NEW: Two stopwatch cards (both) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* Lecturer-level tracking */}
          <StopwatchCard
            userId={userId}
            moduleName={lecturerModuleName}
            sessionType="learn"
            onStopped={(s) => console.log("Lecturer session saved:", s)}
          />

          {/* Course-level tracking */}
          <StopwatchCard
            userId={userId}
            moduleName={courseModuleName}
            sessionType="learn"
            onStopped={(s) => console.log("Course session saved:", s)}
          />
        </div>

        {/* Bio */}
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #242424",
            borderRadius: 14,
            padding: "1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          <h3 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>About</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.8 }}>{selected.bio}</p>
        </div>

        {/* Two col: contact + courses */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Contact info */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 14,
              padding: "1.25rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>
              Contact & Office
            </h3>
            {[
              { label: "Email", value: selected.email, icon: "📧" },
              { label: "Office", value: selected.office, icon: "🏢" },
              { label: "Office Hours", value: selected.hours, icon: "🕐" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: "1px solid #1e1e1e",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Courses (clickable to select for course-level stopwatch) */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 14,
              padding: "1.25rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>
              Courses Taught
            </h3>

            <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>
              Click a course to track time for that course (right stopwatch).
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {selected.coursesList.map((c) => {
                const isSelected = selectedCourse?.code === c.code;

                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCourse(c)}
                    style={{
                      background: isSelected ? `${selected.color}14` : "#1e1e1e",
                      borderRadius: 10,
                      padding: "10px 12px",
                      border: isSelected ? `1px solid ${selected.color}66` : `1px solid ${selected.color}22`,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0" }}>{c.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: selected.color }}>{c.code}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#555" }}>{c.students} students</span>
                      <span style={{ fontSize: 11, color: "#f97316" }}>★ {c.rating}</span>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: selected.color }}>
                        Selected for Course Stopwatch →
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LectureProfile;