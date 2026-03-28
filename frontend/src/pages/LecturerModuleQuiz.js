import React, { useEffect, useState } from "react";

function LecturerModuleQuiz() {
  const [quizForm, setQuizForm] = useState({
    moduleName: "",
    questions: "",
    score: "",
    status: "Not Started",
  });

  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem("moduleQuizzes") || "[]");
    setQuizzes(savedQuizzes);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuiz = () => {
    if (!quizForm.moduleName.trim() || !quizForm.questions) {
      alert("Please fill module name and question count.");
      return;
    }

    const newQuiz = {
      id: Date.now(),
      moduleName: quizForm.moduleName,
      questions: Number(quizForm.questions),
      score: quizForm.score === "" ? 0 : Number(quizForm.score),
      status: quizForm.status,
    };

    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    localStorage.setItem("moduleQuizzes", JSON.stringify(updatedQuizzes));

    setQuizForm({
      moduleName: "",
      questions: "",
      score: "",
      status: "Not Started",
    });
  };

  const handleDeleteQuiz = (id) => {
    const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== id);
    setQuizzes(updatedQuizzes);
    localStorage.setItem("moduleQuizzes", JSON.stringify(updatedQuizzes));
  };

  const handleClearAll = () => {
    const confirmed = window.confirm("Are you sure you want to delete all quizzes?");
    if (!confirmed) return;

    setQuizzes([]);
    localStorage.removeItem("moduleQuizzes");
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#eff6ff",
          color: "#2563eb",
          border: "1px solid #dbeafe",
        };
      case "In Progress":
        return {
          background: "#eef2ff",
          color: "#4f46e5",
          border: "1px solid #c7d2fe",
        };
      default:
        return {
          background: "#f8fafc",
          color: "#475569",
          border: "1px solid #e2e8f0",
        };
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: "24px" }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
            padding: "34px 32px",
            marginBottom: "28px",
            boxShadow: "0 20px 40px rgba(249,115,22,0.20)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-30px",
              width: "190px",
              height: "190px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "90px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255,255,255,0.16)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: "14px",
              marginBottom: "14px",
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              📝
            </span>
            Lecturer Panel
          </div>

          <h1
            style={{
              margin: "0 0 10px 0",
              color: "#fff",
              fontSize: "34px",
              fontWeight: "800",
              position: "relative",
              zIndex: 1,
            }}
          >
            Module Quiz Manager
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              color: "rgba(255,255,255,0.92)",
              fontSize: "15px",
              lineHeight: "1.8",
              position: "relative",
              zIndex: 1,
            }}
          >
            Add and manage module quizzes here. These quizzes will be shown later
            on the student Progress Tracker page.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.9fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Form */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #fed7aa",
              borderRadius: "26px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Add Quiz
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                Fill the form and add a new module quiz for students.
              </p>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Module Name
                </label>
                <input
                  type="text"
                  name="moduleName"
                  value={quizForm.moduleName}
                  onChange={handleChange}
                  placeholder="Enter module name"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #fdba74",
                    background: "#fff7ed",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Number of Questions
                </label>
                <input
                  type="number"
                  name="questions"
                  value={quizForm.questions}
                  onChange={handleChange}
                  placeholder="Enter question count"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #fdba74",
                    background: "#fff7ed",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Score (%)
                </label>
                <input
                  type="number"
                  name="score"
                  value={quizForm.score}
                  onChange={handleChange}
                  placeholder="Enter score"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #fdba74",
                    background: "#fff7ed",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Status
                </label>
                <select
                  name="status"
                  value={quizForm.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #fdba74",
                    background: "#fff7ed",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                onClick={handleAddQuiz}
                style={{
                  marginTop: "6px",
                  border: "none",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "14px 18px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(249,115,22,0.24)",
                }}
              >
                Add Module Quiz
              </button>

              <button
                onClick={handleClearAll}
                style={{
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#dc2626",
                  borderRadius: "16px",
                  padding: "13px 18px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Clear All Quizzes
              </button>
            </div>
          </div>

          {/* Right Quiz List */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #fed7aa",
              borderRadius: "26px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Added Module Quizzes
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                These quizzes will be visible on the student side in the next step.
              </p>
            </div>

            {quizzes.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #fdba74",
                  background: "#fff7ed",
                  borderRadius: "20px",
                  padding: "34px 20px",
                  textAlign: "center",
                  color: "#9a3412",
                  fontWeight: "600",
                }}
              >
                No quizzes added yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      border: "1px solid #dbeafe",
                      background: "#f8fbff",
                      borderRadius: "24px",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#0f172a",
                          lineHeight: "1.4",
                        }}
                      >
                        {quiz.moduleName}
                      </h3>

                      <span
                        style={{
                          ...getStatusBadgeStyle(quiz.status),
                          borderRadius: "999px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 8px 0", color: "#334155", fontSize: "15px" }}>
                      Questions: {quiz.questions}
                    </p>

                    <p style={{ margin: "0 0 18px 0", color: "#334155", fontSize: "15px" }}>
                      Score: {quiz.score}%
                    </p>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      style={{
                        border: "none",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "#fff",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Delete Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerModuleQuiz;