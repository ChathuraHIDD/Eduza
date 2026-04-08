import React, { useEffect, useMemo, useState } from "react";
import { fetchModules } from "../utils/moduleApi";

const SELF_CHECK_STORAGE_KEY = "moduleSelfChecks";
const QUESTION_COUNT = 10;
const OPTION_LABELS = ["A", "B", "C", "D"];

const createEmptyQuestion = (index) => ({
  id: index + 1,
  text: "",
  options: ["", "", "", ""],
  correctOption: "",
});

const createInitialForm = () => ({
  moduleId: "",
  status: "Not Started",
  questions: Array.from({ length: QUESTION_COUNT }, (_, index) => createEmptyQuestion(index)),
});

const loadStoredSelfChecks = () => {
  try {
    const raw = localStorage.getItem(SELF_CHECK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function LecturerModuleSelfCheck() {
  const [form, setForm] = useState(createInitialForm);
  const [selfChecks, setSelfChecks] = useState(loadStoredSelfChecks);
  const [modules, setModules] = useState([]);
  const [moduleLoadError, setModuleLoadError] = useState("");
  const [modulesLoading, setModulesLoading] = useState(true);
  const [formError, setFormError] = useState("");

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

  const persistSelfChecks = (nextSelfChecks) => {
    setSelfChecks(nextSelfChecks);
    localStorage.setItem(SELF_CHECK_STORAGE_KEY, JSON.stringify(nextSelfChecks));
  };

  const handleModuleSelect = (event) => {
    setForm((prev) => ({
      ...prev,
      moduleId: event.target.value,
    }));
    setFormError("");
  };

  const handleStatusChange = (event) => {
    setForm((prev) => ({
      ...prev,
      status: event.target.value,
    }));
  };

  const handleQuestionTextChange = (index, value) => {
    setForm((prev) => {
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
    setForm((prev) => {
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
    setForm((prev) => {
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

  const validateSelfCheck = () => {
    if (!form.moduleId) {
      return "Please select a module from the database.";
    }

    if (form.questions.length !== QUESTION_COUNT) {
      return `Self check must include exactly ${QUESTION_COUNT} questions.`;
    }

    for (let index = 0; index < form.questions.length; index += 1) {
      const question = form.questions[index];
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

  const handleAddSelfCheck = () => {
    const validationMessage = validateSelfCheck();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const selectedModule = moduleOptions.find(
      (module) => module.id === form.moduleId
    );

    if (!selectedModule) {
      setFormError("Selected module was not found. Please refresh module list.");
      return;
    }

    const questions = form.questions.map((question) => ({
      id: question.id,
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()),
      correctOption: question.correctOption,
      correctOptionIndex: OPTION_LABELS.indexOf(question.correctOption),
    }));

    const newSelfCheck = {
      id: Date.now(),
      moduleId: selectedModule.id,
      moduleName: selectedModule.name,
      moduleCode: selectedModule.code,
      status: form.status,
      questionCount: QUESTION_COUNT,
      questions,
      createdAt: new Date().toISOString(),
      type: "selfcheck",
    };

    persistSelfChecks([newSelfCheck, ...selfChecks]);
    setForm(createInitialForm());
    setFormError("");
  };

  const handleDeleteSelfCheck = (id) => {
    const updated = selfChecks.filter((item) => item.id !== id);
    persistSelfChecks(updated);
  };

  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all self-check entries?"
    );
    if (!confirmed) return;
    setSelfChecks([]);
    localStorage.removeItem(SELF_CHECK_STORAGE_KEY);
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
          background: "#e0f2fe",
          color: "#075985",
          border: "1px solid #7dd3fc",
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
            borderRadius: "28px",
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 55%, #a855f7 100%)",
            padding: "34px 32px",
            marginBottom: "28px",
            boxShadow: "0 20px 40px rgba(124,58,237,0.20)",
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
            Module Self Check Manager
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "840px",
              color: "rgba(255,255,255,0.92)",
              fontSize: "15px",
              lineHeight: "1.8",
              position: "relative",
              zIndex: 1,
            }}
          >
            Create self-check sets that students can repeat anytime. Each self-check contains 10 questions and appears in the Progress Tracker for instant performance tracking.
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
              border: "1px solid #e9d5ff",
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
                Create Self Check
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                Choose a module, set the status, and build a 10-question self-check with four answer options per question.
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
                  value={form.moduleId}
                  onChange={handleModuleSelect}
                  disabled={modulesLoading}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #c084fc",
                    background: "#f8fafc",
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
                  value={form.status}
                  onChange={handleStatusChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #c084fc",
                    background: "#f8fafc",
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
                  border: "1px solid #f5c2c7",
                  background: "#fff1f2",
                  color: "#b91c1c",
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
                  border: "1px solid #f5c2c7",
                  background: "#fff1f2",
                  color: "#b91c1c",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {formError}
              </div>
            ) : null}

            <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: "2px" }}>
              {form.questions.map((question, index) => (
                <div
                  key={`question-${question.id}`}
                  style={{
                    marginBottom: "22px",
                    padding: "18px 20px",
                    borderRadius: "22px",
                    border: "1px solid #e5d5fc",
                    background: "#faf5ff",
                  }}
                >
                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Question {index + 1}
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(event) => handleQuestionTextChange(index, event.target.value)}
                      rows={2}
                      placeholder="Enter question text"
                      style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "1px solid #c4b5fd",
                        padding: "14px 16px",
                        fontSize: "14px",
                        resize: "vertical",
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
                    {question.options.map((option, optionIndex) => (
                      <div key={`option-${optionIndex}`}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#334155",
                          }}
                        >
                          Option {OPTION_LABELS[optionIndex]}
                        </label>
                        <input
                          value={option}
                          onChange={(event) => handleOptionChange(index, optionIndex, event.target.value)}
                          placeholder={`Enter option ${OPTION_LABELS[optionIndex]}`}
                          style={{
                            width: "100%",
                            borderRadius: "14px",
                            border: "1px solid #c4b5fd",
                            padding: "12px 14px",
                            fontSize: "14px",
                            outline: "none",
                            background: "#fff",
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#334155",
                      }}
                    >
                      Correct Answer
                    </label>
                    <select
                      value={question.correctOption}
                      onChange={(event) => handleCorrectOptionChange(index, event.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "1px solid #c4b5fd",
                        padding: "14px 16px",
                        fontSize: "14px",
                        outline: "none",
                        background: "#fff",
                      }}
                    >
                      <option value="">Select correct answer</option>
                      {OPTION_LABELS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px" }}>
              <button
                onClick={handleAddSelfCheck}
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background: "#7c3aed",
                  color: "#fff",
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Save Self Check
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #c4b5fd",
                  background: "#fff",
                  color: "#334155",
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5d5ff",
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
                Existing Self Checks
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#64748b",
                }}
              >
                Review or delete self-checks created for students.
              </p>
            </div>

            {selfChecks.length === 0 ? (
              <div
                style={{
                  borderRadius: "22px",
                  padding: "28px 24px",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                No self-checks have been created yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {selfChecks.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: "24px",
                      padding: "18px 20px",
                      border: "1px solid #e9d5ff",
                      background: "#fff",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {item.moduleCode ? `${item.moduleCode} - ${item.moduleName}` : item.moduleName}
                      </div>
                      <div style={{ marginTop: "6px", color: "#64748b", fontSize: "14px" }}>
                        Created: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div
                        style={{
                          borderRadius: "16px",
                          padding: "10px 14px",
                          background: "#eef2ff",
                          color: "#4338ca",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {item.status}
                      </div>
                      <button
                        onClick={() => handleDeleteSelfCheck(item.id)}
                        style={{
                          borderRadius: "16px",
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#dc2626",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Delete
                      </button>
                    </div>
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

export default LecturerModuleSelfCheck;
