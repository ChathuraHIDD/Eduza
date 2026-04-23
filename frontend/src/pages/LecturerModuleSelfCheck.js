import React, { useEffect, useMemo, useState } from "react";
import { fetchModules } from "../utils/moduleApi";
import {
  createProgressAssessment,
  deleteProgressAssessment,
  listProgressAssessments,
  updateProgressAssessment,
} from "../utils/progressTrackerApi";

const SELF_CHECK_STORAGE_KEY = "moduleSelfChecks";

const createEmptyOutcome = (index) => ({
  id: `${Date.now()}-${index + 1}`,
  text: "",
});

const createInitialForm = () => ({
  moduleId: "",
  status: "Not Started",
  learningOutcomes: [createEmptyOutcome(0)],
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
  const [editingSelfCheckId, setEditingSelfCheckId] = useState("");

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

    const loadSelfChecksFromDb = async () => {
      try {
        const data = await listProgressAssessments("selfcheck");
        if (!isMounted) return;

        const normalized = data.map((item) => ({
          ...item,
          id: item.id,
          type: "selfcheck",
          learningOutcomes: Array.isArray(item.learningOutcomes)
            ? item.learningOutcomes
            : [],
        }));

        setSelfChecks(normalized);
        localStorage.setItem(SELF_CHECK_STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // Keep local fallback when API is unavailable.
      }
    };

    loadSelfChecksFromDb();

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

  const handleOutcomeTextChange = (index, value) => {
    setForm((prev) => {
      const nextOutcomes = [...prev.learningOutcomes];
      nextOutcomes[index] = {
        ...nextOutcomes[index],
        text: value,
      };
      return {
        ...prev,
        learningOutcomes: nextOutcomes,
      };
    });
  };

  const handleAddOutcome = () => {
    setForm((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, createEmptyOutcome(prev.learningOutcomes.length)],
    }));
  };

  const handleRemoveOutcome = (index) => {
    setForm((prev) => {
      if (prev.learningOutcomes.length === 1) return prev;

      const nextOutcomes = prev.learningOutcomes.filter((_, outcomeIndex) => outcomeIndex !== index);
      return {
        ...prev,
        learningOutcomes: nextOutcomes.map((outcome, outcomeIndex) => ({
          ...outcome,
          id: outcome.id || `${Date.now()}-${outcomeIndex + 1}`,
        })),
      };
    });
  };

  const startEditSelfCheck = (item) => {
    setEditingSelfCheckId(String(item.id));
    setForm({
      moduleId: String(item.moduleId || ""),
      status: item.status || "Not Started",
      learningOutcomes:
        Array.isArray(item.learningOutcomes) && item.learningOutcomes.length > 0
          ? item.learningOutcomes.map((outcome, index) => ({
              id: String(outcome.id || `${Date.now()}-${index + 1}`),
              text: outcome.text || "",
            }))
          : [createEmptyOutcome(0)],
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(createInitialForm());
    setEditingSelfCheckId("");
    setFormError("");
  };

  const validateSelfCheck = () => {
    if (!form.moduleId) {
      return "Please select a module from the database.";
    }

    if (form.learningOutcomes.length < 1) {
      return "Self check must include at least one learning outcome.";
    }

    for (let index = 0; index < form.learningOutcomes.length; index += 1) {
      const outcome = form.learningOutcomes[index];
      if (!outcome.text.trim()) {
        return `Learning outcome ${index + 1} text is required.`;
      }
    }

    return "";
  };

  const handleSaveSelfCheck = async () => {
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

    const learningOutcomes = form.learningOutcomes.map((outcome) => ({
      id: outcome.id,
      text: outcome.text.trim(),
    }));

    const newSelfCheck = {
      moduleId: selectedModule.id,
      moduleName: selectedModule.name,
      moduleCode: selectedModule.code,
      status: form.status,
      learningOutcomes,
      createdAt: new Date().toISOString(),
      type: "selfcheck",
    };

    try {
      const saved = editingSelfCheckId
        ? await updateProgressAssessment(editingSelfCheckId, newSelfCheck)
        : await createProgressAssessment(newSelfCheck);
      const next = editingSelfCheckId
        ? [saved, ...selfChecks.filter((item) => String(item.id) !== String(editingSelfCheckId))]
        : [saved, ...selfChecks];
      persistSelfChecks(next);
      resetForm();
      setFormError("");
    } catch (error) {
      setFormError(error?.message || "Failed to save self-check in database.");
    }
  };

  const handleDeleteSelfCheck = async (id) => {
    try {
      if (typeof id === "string") {
        await deleteProgressAssessment(id);
      }
    } catch {
      // Continue local removal to avoid blocking UI when API fails.
    }

    const updated = selfChecks.filter((item) => String(item.id) !== String(id));
    persistSelfChecks(updated);
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all self-check entries?"
    );
    if (!confirmed) return;

    await Promise.all(
      selfChecks
        .map((item) => item.id)
        .filter((id) => typeof id === "string")
        .map((id) => deleteProgressAssessment(id).catch(() => null))
    );

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
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
            borderRadius: 24,
            padding: "28px 32px",
            position: "relative",
            overflow: "hidden",
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
              right: 100,
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
            Module Self Check Manager
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
            Create self-check sets that students can repeat anytime. Each self-check contains 5 learning outcomes that students will self-assess with confidence ratings, skill checklists, and reflections.
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
                Choose a module, set the status, and add as many learning outcomes as needed.
              </p>
            </div>

            {editingSelfCheckId ? (
              <div style={{ marginBottom: "14px", fontSize: "13px", fontWeight: 700, color: "#9a3412" }}>
                Editing existing self-check
              </div>
            ) : null}

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
                  value={form.status}
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

            <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: "2px", display: "grid", gap: "12px" }}>
              {form.learningOutcomes.map((outcome, index) => (
                <div
                  key={`outcome-${outcome.id}`}
                  style={{
                    marginBottom: "22px",
                    padding: "18px 20px",
                    borderRadius: "22px",
                    border: "1px solid #fed7aa",
                    background: "#fffaf5",
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
                      Learning Outcome {index + 1}
                    </label>
                    <textarea
                      value={outcome.text}
                      onChange={(event) => handleOutcomeTextChange(index, event.target.value)}
                      rows={3}
                      placeholder="Enter learning outcome text (e.g., 'Understand the concept of normalization in databases')"
                      style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "1px solid #fdba74",
                        padding: "14px 16px",
                        fontSize: "14px",
                        resize: "vertical",
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(index)}
                      disabled={form.learningOutcomes.length === 1}
                      style={{
                        border: "1px solid #fecaca",
                        background: form.learningOutcomes.length === 1 ? "#fff1f2" : "#fff",
                        color: "#dc2626",
                        borderRadius: "999px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: form.learningOutcomes.length === 1 ? "not-allowed" : "pointer",
                        opacity: form.learningOutcomes.length === 1 ? 0.7 : 1,
                      }}
                    >
                      Delete Learning Outcome
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "2px" }}>
                <button
                  type="button"
                  onClick={handleAddOutcome}
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
                  + Add Learning Outcome
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px" }}>
              <button
                onClick={handleSaveSelfCheck}
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {editingSelfCheckId ? "Update Self Check" : "Save Self Check"}
              </button>
              <button
                onClick={resetForm}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #fdba74",
                  background: "#fff",
                  color: "#9a3412",
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Reset Form
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#dc2626",
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
                      border: "1px solid #fed7aa",
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
                          ...getStatusBadgeStyle(item.status),
                          borderRadius: "16px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {item.status}
                      </div>
                      <button
                        onClick={() => startEditSelfCheck(item)}
                        style={{
                          borderRadius: "16px",
                          border: "1px solid #fdba74",
                          background: "#fff7ed",
                          color: "#9a3412",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Edit
                      </button>
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
