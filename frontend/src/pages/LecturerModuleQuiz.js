import React, { useEffect, useMemo, useState } from "react";
import { fetchModules } from "../utils/moduleApi";
import {
  createProgressAssessment,
  deleteProgressAssessment,
  listProgressAssessments,
  updateProgressAssessment,
} from "../utils/progressTrackerApi";

const QUIZ_STORAGE_KEY = "moduleQuizzes";
const OPTION_LABELS = ["A", "B", "C", "D"];

const createEmptyQuestion = (index) => ({
  id: `${Date.now()}-${index + 1}`,
  text: "",
  options: ["", "", "", ""],
  correctOption: "",
});

const createInitialForm = () => ({
  moduleId: "",
  status: "Not Started",
  questions: [createEmptyQuestion(0)],
});

const loadStoredQuizzes = () => {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function LecturerModuleQuiz() {
  const [quizForm, setQuizForm] = useState(createInitialForm);
  const [quizzes, setQuizzes] = useState(loadStoredQuizzes);
  const [modules, setModules] = useState([]);
  const [moduleLoadError, setModuleLoadError] = useState("");
  const [modulesLoading, setModulesLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [editingQuizId, setEditingQuizId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadModules = async () => {
      try {
        setModulesLoading(true);
        setModuleLoadError("");

        const response = await fetchModules();
        const payload = Array.isArray(response)
          ? response
          : response?.modules || response?.data || [];

        if (!isMounted) return;

        const normalized = payload
          .filter((module) => module && (module._id || module.id))
          .map((module) => ({
            id: String(module._id || module.id),
            name: module.name || module.moduleName || "Unnamed Module",
            code: module.code || "",
            status: module.status || "",
            approvalStatus: module.approvalStatus || "",
          }));

        setModules(normalized);
      } catch (error) {
        if (!isMounted) return;
        setModuleLoadError(
          error?.message || "Failed to load modules from the database."
        );
      } finally {
        if (isMounted) setModulesLoading(false);
      }
    };

    loadModules();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadQuizzesFromDb = async () => {
      try {
        const data = await listProgressAssessments("quiz");
        if (!isMounted) return;

        const normalized = data.map((item) => ({
          ...item,
          id: item.id,
          questionCount:
            Number(item.questionCount) ||
            (Array.isArray(item.questions) ? item.questions.length : 0),
          questions: Array.isArray(item.questions) ? item.questions : [],
        }));

        setQuizzes(normalized);
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // Keep local fallback when API is unavailable.
      }
    };

    loadQuizzesFromDb();

    return () => {
      isMounted = false;
    };
  }, []);

  const moduleOptions = useMemo(() => {
    return modules
      .filter((module) => {
        const status = String(module.status || "").toLowerCase();
        const approval = String(module.approvalStatus || "").toLowerCase();
        const statusOk = !status || status === "active";
        const approvalOk = !approval || approval === "approved";
        return statusOk && approvalOk;
      })
      .sort((a, b) => {
        const byCode = (a.code || "").localeCompare(b.code || "");
        if (byCode !== 0) return byCode;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [modules]);

  const persistQuizzes = (nextQuizzes) => {
    setQuizzes(nextQuizzes);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(nextQuizzes));
  };

  const handleModuleSelect = (event) => {
    setQuizForm((prev) => ({
      ...prev,
      moduleId: event.target.value,
    }));
    setFormError("");
  };

  const handleStatusChange = (event) => {
    setQuizForm((prev) => ({
      ...prev,
      status: event.target.value,
    }));
  };

  const handleQuestionTextChange = (index, value) => {
    setQuizForm((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[index] = {
        ...nextQuestions[index],
        text: value,
      };

      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizForm((prev) => {
      const nextQuestions = [...prev.questions];
      const nextOptions = [...nextQuestions[questionIndex].options];
      nextOptions[optionIndex] = value;
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        options: nextOptions,
      };

      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  const handleCorrectOptionChange = (index, value) => {
    setQuizForm((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[index] = {
        ...nextQuestions[index],
        correctOption: value,
      };

      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  const handleAddQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(prev.questions.length)],
    }));
  };

  const handleRemoveQuestion = (index) => {
    setQuizForm((prev) => {
      if (prev.questions.length === 1) return prev;
      const nextQuestions = prev.questions.filter((_, questionIndex) => questionIndex !== index);
      return {
        ...prev,
        questions: nextQuestions.map((question, questionIndex) => ({
          ...question,
          id: question.id || `${Date.now()}-${questionIndex + 1}`,
        })),
      };
    });
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(String(quiz.id));
    setQuizForm({
      moduleId: String(quiz.moduleId || ""),
      status: quiz.status || "Not Started",
      questions:
        Array.isArray(quiz.questions) && quiz.questions.length > 0
          ? quiz.questions.map((question, index) => ({
              id: String(question.id || `${Date.now()}-${index + 1}`),
              text: question.text || "",
              options: Array.isArray(question.options)
                ? [...question.options, "", "", "", ""].slice(0, 4)
                : ["", "", "", ""],
              correctOption: question.correctOption || "",
            }))
          : [createEmptyQuestion(0)],
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setQuizForm(createInitialForm());
    setEditingQuizId("");
    setFormError("");
  };

  const validateQuiz = () => {
    if (!quizForm.moduleId) {
      return "Please select a module from the database.";
    }

    if (quizForm.questions.length < 1) {
      return "Quiz must include at least one question.";
    }

    for (let index = 0; index < quizForm.questions.length; index += 1) {
      const question = quizForm.questions[index];

      if (!question.text.trim()) {
        return `Question ${index + 1} text is required.`;
      }

      for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
        if (!question.options[optionIndex].trim()) {
          return `Question ${index + 1} option ${OPTION_LABELS[optionIndex]} is required.`;
        }
      }

      if (!OPTION_LABELS.includes(question.correctOption)) {
        return `Please select the correct answer for question ${index + 1}.`;
      }
    }

    return "";
  };

  const handleSaveQuiz = async () => {
    const validationMessage = validateQuiz();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const selectedModule = moduleOptions.find(
      (module) => module.id === quizForm.moduleId
    );

    if (!selectedModule) {
      setFormError("Selected module was not found. Please refresh module list.");
      return;
    }

    const questions = quizForm.questions.map((question, index) => ({
      id: question.id,
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()),
      correctOption: question.correctOption,
      correctOptionIndex: OPTION_LABELS.indexOf(question.correctOption),
      order: index + 1,
    }));

    const newQuiz = {
      type: "quiz",
      moduleId: selectedModule.id,
      moduleName: selectedModule.name,
      moduleCode: selectedModule.code,
      status: quizForm.status,
      score: 0,
      questionCount: questions.length,
      questions,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = editingQuizId
        ? await updateProgressAssessment(editingQuizId, newQuiz)
        : await createProgressAssessment(newQuiz);
      const next = editingQuizId
        ? [saved, ...quizzes.filter((quiz) => String(quiz.id) !== String(editingQuizId))]
        : [saved, ...quizzes];
      persistQuizzes(next);
      resetForm();
      setFormError("");
    } catch (error) {
      setFormError(error?.message || "Failed to save quiz in database.");
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      if (typeof id === "string") {
        await deleteProgressAssessment(id);
      }
    } catch {
      // Continue local removal to avoid blocking UI when API fails.
    }

    const updatedQuizzes = quizzes.filter((quiz) => String(quiz.id) !== String(id));
    persistQuizzes(updatedQuizzes);
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all quizzes?");
    if (!confirmed) return;

    await Promise.all(
      quizzes
        .map((quiz) => quiz.id)
        .filter((id) => typeof id === "string")
        .map((id) => deleteProgressAssessment(id).catch(() => null))
    );

    setQuizzes([]);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        };
      case "In Progress":
        return {
          background: "#ffedd5",
          color: "#9a3412",
          border: "1px solid #fdba74",
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
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
            padding: "28px 32px",
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -55,
              right: "90px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div
            style={{
              fontSize: 13,
              color: "#fff",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              position: "relative",
              zIndex: 1,
            }}
          >
            Lecturer Panel
          </div>

          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              position: "relative",
              zIndex: 1,
            }}
          >
            Module Quiz Manager
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              maxWidth: "760px",
              color: "rgba(255,255,255,0.92)",
              fontSize: 14,
              lineHeight: 1.7,
              position: "relative",
              zIndex: 1,
            }}
          >
            Create quizzes with exactly 10 questions. Each question must include
            four answer options and one correct answer. Saved quizzes will be shown
            in Progress Tracker under the selected module.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
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
                {editingQuizId ? "Update Module Quiz" : "Create Module Quiz"}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                Modules are loaded from the database. Choose one module and add as many questions as needed.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
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
                  Module (DB)
                </label>
                <select
                  value={quizForm.moduleId}
                  onChange={handleModuleSelect}
                  disabled={modulesLoading}
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
                  <option value="">
                    {modulesLoading
                      ? "Loading modules..."
                      : "Select module from database"}
                  </option>
                  {moduleOptions.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.code ? `${module.code} - ${module.name}` : module.name}
                    </option>
                  ))}
                </select>
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
                  value={quizForm.status}
                  onChange={handleStatusChange}
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
            </div>

            {moduleLoadError ? (
              <div
                style={{
                  marginBottom: "16px",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {moduleLoadError}
              </div>
            ) : null}

            {formError ? (
              <div
                style={{
                  marginBottom: "16px",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {formError}
              </div>
            ) : null}

            <div
              style={{
                maxHeight: "68vh",
                overflowY: "auto",
                paddingRight: "4px",
                display: "grid",
                gap: "14px",
              }}
            >
              {quizForm.questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    border: "1px solid #fed7aa",
                    borderRadius: "18px",
                    background: "#fffaf5",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#0f172a",
                      }}
                    >
                      Question {index + 1}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#9a3412",
                        background: "#ffedd5",
                        borderRadius: "999px",
                        padding: "4px 10px",
                      }}
                    >
                      4 options + 1 correct
                    </span>
                  </div>

                  <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                      Question {index + 1}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={question.text}
                    onChange={(event) =>
                      handleQuestionTextChange(index, event.target.value)
                    }
                    placeholder={`Enter question ${index + 1}`}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #fdba74",
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      outline: "none",
                      marginBottom: "10px",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {OPTION_LABELS.map((label, optionIndex) => (
                      <input
                        key={label}
                        type="text"
                        value={question.options[optionIndex]}
                        onChange={(event) =>
                          handleOptionChange(index, optionIndex, event.target.value)
                        }
                        placeholder={`Option ${label}`}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          border: "1px solid #fdba74",
                          background: "#fff",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    ))}
                  </div>

                  <select
                    value={question.correctOption}
                    onChange={(event) =>
                      handleCorrectOptionChange(index, event.target.value)
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #fdba74",
                      background: "#fff7ed",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="">Select correct option</option>
                    {OPTION_LABELS.map((label) => (
                      <option key={label} value={label}>
                        Correct Answer: {label}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      disabled={quizForm.questions.length === 1}
                      style={{
                        border: "1px solid #fecaca",
                        background: quizForm.questions.length === 1 ? "#fff1f2" : "#fff",
                        color: "#dc2626",
                        borderRadius: "999px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: quizForm.questions.length === 1 ? "not-allowed" : "pointer",
                        opacity: quizForm.questions.length === 1 ? 0.7 : 1,
                      }}
                    >
                      Delete Question
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "2px" }}>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  style={{
                    border: "1px solid #fdba74",
                    background: "#fff7ed",
                    color: "#9a3412",
                    borderRadius: "14px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  + Add Question
                </button>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveQuiz}
                style={{
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
                {editingQuizId ? "Update Quiz" : "Save Quiz"}
              </button>

              <button
                onClick={() => {
                  resetForm();
                }}
                style={{
                  border: "1px solid #fdba74",
                  background: "#fff",
                  color: "#9a3412",
                  borderRadius: "16px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Reset Form
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #fed7aa",
              borderRadius: "26px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Saved Quizzes
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                These are available in Progress Tracker under each module.
              </p>
            </div>

            <div style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleClearAll}
                style={{
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#dc2626",
                  borderRadius: "14px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Clear All Quizzes
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px", maxHeight: "68vh", overflowY: "auto" }}>
              {quizzes.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #fdba74",
                    background: "#fff7ed",
                    borderRadius: "16px",
                    padding: "24px 14px",
                    textAlign: "center",
                    color: "#9a3412",
                    fontWeight: "600",
                  }}
                >
                  No quizzes added yet.
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      border: "1px solid #fed7aa",
                      background: "#fffaf5",
                      borderRadius: "16px",
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: "800",
                          color: "#0f172a",
                          lineHeight: "1.4",
                        }}
                      >
                        {quiz.moduleCode
                          ? `${quiz.moduleCode} - ${quiz.moduleName}`
                          : quiz.moduleName}
                      </h3>

                      <span
                        style={{
                          ...getStatusBadgeStyle(quiz.status),
                          borderRadius: "999px",
                          padding: "5px 10px",
                          fontSize: "11px",
                          fontWeight: "800",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 4px 0", color: "#334155", fontSize: "13px" }}>
                      Questions: {Array.isArray(quiz.questions) ? quiz.questions.length : 0}
                    </p>

                    <p style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "13px" }}>
                      Created: {new Date(quiz.createdAt || Date.now()).toLocaleString()}
                    </p>

                    <button
                      onClick={() => startEditQuiz(quiz)}
                      style={{
                        border: "1px solid #fdba74",
                        background: "#fff7ed",
                        color: "#9a3412",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Edit Quiz
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      style={{
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Delete Quiz
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerModuleQuiz;
