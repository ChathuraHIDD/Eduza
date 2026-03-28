import React, { useCallback, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const QUIZ_STORAGE_KEY = "moduleQuizzes";
const OPTION_LABELS = ["A", "B", "C", "D"];
const GRADING_SCALE = [
  { grade: "A+", gpa: 4.0, marks: "90-100" },
  { grade: "A", gpa: 4.0, marks: "80-89" },
  { grade: "A-", gpa: 3.7, marks: "75-79" },
  { grade: "B+", gpa: 3.3, marks: "70-74" },
  { grade: "B", gpa: 3.0, marks: "65-69" },
  { grade: "B-", gpa: 2.7, marks: "60-64" },
  { grade: "C+", gpa: 2.3, marks: "55-59" },
  { grade: "C", gpa: 2.0, marks: "45-54" },
  { grade: "C-", gpa: 1.7, marks: "40-44" },
  { grade: "D+", gpa: 1.3, marks: "35-39" },
  { grade: "D", gpa: 1.0, marks: "30-34" },
  { grade: "E", gpa: 0.0, marks: "0-29" },
];

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

function ProgressTracker() {
  const categories = [
    {
      id: "gpa",
      title: "Calculate My GPA",
      description: "Calculate your GPA using module grades and credit values.",
      icon: "🎓",
      accent: "orange",
    },
    {
      id: "quiz",
      title: "Module Quiz",
      description: "Test your understanding with quick quizzes for each module.",
      icon: "📝",
      accent: "blue",
    },
    {
      id: "selfcheck",
      title: "Self Check",
      description: "Track your study confidence and performance using progress graphs.",
      icon: "📈",
      accent: "purple",
    },
    {
      id: "streak",
      title: "Streak Badge",
      description: "See your consistency and unlock study streak achievements.",
      icon: "🔥",
      accent: "green",
    },
  ];

  const gradingScale = GRADING_SCALE;

  const modeOptions = [
    { title: "Custom", subtitle: "Add your own" },
    { title: "Y1S1 Only", subtitle: "New Syllabus" },
    { title: "Y1S1 Only", subtitle: "Old Syllabus" },
    { title: "Y1S2 Only", subtitle: "New Syllabus" },
    { title: "Y1S2 Only", subtitle: "Old Syllabus" },
    { title: "Y2S1 Only", subtitle: "Old Syllabus" },
    { title: "Y2S2 Only", subtitle: "Old Syllabus" },
    { title: "Up to Y1S2", subtitle: "New Syllabus" },
    { title: "Up to Y2S1", subtitle: "Old Syllabus" },
    { title: "Up to Y2S2", subtitle: "Old Syllabus" },
  ];

  const [activeCategory, setActiveCategory] = useState("gpa");
  const [selectedMode, setSelectedMode] = useState("Custom-Add your own");
  const [modules, setModules] = useState([
    { id: 1, moduleName: "", credits: 3, grade: "A" },
  ]);
  const [quizModules] = useState(loadStoredQuizzes);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizAttemptAnswers, setQuizAttemptAnswers] = useState({});
  const [quizValidationError, setQuizValidationError] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [wrongAnswerSearchQuery, setWrongAnswerSearchQuery] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const [selfCheckData] = useState([
    { label: "Week 1", value: 58 },
    { label: "Week 2", value: 63 },
    { label: "Week 3", value: 60 },
    { label: "Week 4", value: 72 },
    { label: "Week 5", value: 78 },
    { label: "Week 6", value: 84 },
  ]);

  const [streakData] = useState({
    currentStreak: 9,
    bestStreak: 21,
    studyDays: 46,
    level: "Gold Badge",
  });

  const normalizedQuizModules = useMemo(() => {
    return quizModules.map((quiz) => {
      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
      return {
        ...quiz,
        moduleName: quiz.moduleName || "Unnamed Module",
        moduleCode: quiz.moduleCode || "",
        questionCount: questions.length || Number(quiz.questions) || 0,
        questions,
      };
    });
  }, [quizModules]);

  const selectedQuiz = useMemo(() => {
    if (!selectedQuizId) return null;
    return (
      normalizedQuizModules.find((quiz) => String(quiz.id) === String(selectedQuizId)) ||
      null
    );
  }, [normalizedQuizModules, selectedQuizId]);

  const getCorrectOptionLabel = (question) => {
    if (OPTION_LABELS.includes(question?.correctOption)) {
      return question.correctOption;
    }

    const index = Number(question?.correctOptionIndex);
    if (Number.isInteger(index) && index >= 0 && index < OPTION_LABELS.length) {
      return OPTION_LABELS[index];
    }

    return "";
  };

  const getOptionTextByLabel = (question, label) => {
    const index = OPTION_LABELS.indexOf(label);
    if (index < 0) return "Not selected";
    return Array.isArray(question?.options) ? question.options[index] || "" : "";
  };

  const handleStartQuiz = (quizId) => {
    if (String(selectedQuizId) === String(quizId)) {
      setSelectedQuizId(null);
      setQuizAttemptAnswers({});
      setQuizValidationError("");
      setQuizResult(null);
      setWrongAnswerSearchQuery("");
      return;
    }

    setSelectedQuizId(quizId);
    setQuizAttemptAnswers({});
    setQuizValidationError("");
    setQuizResult(null);
    setWrongAnswerSearchQuery("");
  };

  const handleSelectAnswer = (questionIndex, optionLabel) => {
    setQuizAttemptAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLabel,
    }));
    setQuizValidationError("");
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz || !Array.isArray(selectedQuiz.questions) || selectedQuiz.questions.length === 0) {
      setQuizValidationError("This quiz has no available questions.");
      return;
    }

    const unanswered = selectedQuiz.questions
      .map((_, index) => index)
      .filter((index) => !quizAttemptAnswers[index]);

    if (unanswered.length > 0) {
      setQuizValidationError(
        `Please answer all questions before submitting. Missing: ${unanswered
          .map((value) => value + 1)
          .join(", ")}`
      );
      return;
    }

    const wrongAnswers = [];
    let correctCount = 0;

    selectedQuiz.questions.forEach((question, index) => {
      const selectedLabel = quizAttemptAnswers[index];
      const correctLabel = getCorrectOptionLabel(question);
      const isCorrect = selectedLabel === correctLabel;

      if (isCorrect) {
        correctCount += 1;
      } else {
        wrongAnswers.push({
          questionNumber: index + 1,
          questionText: question.text || `Question ${index + 1}`,
          selectedLabel,
          selectedText: getOptionTextByLabel(question, selectedLabel),
          correctLabel,
          correctText: getOptionTextByLabel(question, correctLabel),
        });
      }
    });

    const score100 = Math.round(
      (correctCount / selectedQuiz.questions.length) * 100
    );

    setQuizResult({
      totalQuestions: selectedQuiz.questions.length,
      correctCount,
      wrongCount: wrongAnswers.length,
      score100,
      wrongAnswers,
    });
    setWrongAnswerSearchQuery("");
    setQuizValidationError("");
  };

  const filteredWrongAnswers = useMemo(() => {
    if (!quizResult) return [];
    const source = Array.isArray(quizResult.wrongAnswers)
      ? quizResult.wrongAnswers
      : [];
    const query = wrongAnswerSearchQuery.trim().toLowerCase();
    if (!query) return source;

    return source.filter((item) => {
      return [
        String(item.questionNumber || ""),
        item.questionText || "",
        item.selectedLabel || "",
        item.selectedText || "",
        item.correctLabel || "",
        item.correctText || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [quizResult, wrongAnswerSearchQuery]);

  const handleDownloadWrongAnswersPdf = () => {
    if (!selectedQuiz || !quizResult) {
      alert("No quiz result available to export.");
      return;
    }

    const reportItems = filteredWrongAnswers;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const border = 24;
    const contentX = 46;
    const contentWidth = pageWidth - contentX * 2;
    let y = 132;

    const drawPageFrame = () => {
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(1.6);
      doc.rect(border, border, pageWidth - border * 2, pageHeight - border * 2);

      doc.setFillColor(249, 115, 22);
      doc.rect(border + 8, border + 8, pageWidth - (border + 8) * 2, 64, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("EDUZA", border + 20, border + 48);

      doc.setFontSize(12);
      doc.text("Wrong Answers Report", pageWidth - border - 20, border + 48, {
        align: "right",
      });

      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const moduleName = selectedQuiz.moduleCode
        ? `${selectedQuiz.moduleCode} - ${selectedQuiz.moduleName}`
        : selectedQuiz.moduleName;
      doc.text(moduleName, contentX, 118);
    };

    const ensureSpace = (requiredHeight) => {
      if (y + requiredHeight <= pageHeight - 52) return;
      doc.addPage();
      drawPageFrame();
      y = 132;
    };

    drawPageFrame();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const generatedAt = new Date().toLocaleString();
    const filterLabel = wrongAnswerSearchQuery.trim()
      ? `Filter: ${wrongAnswerSearchQuery.trim()}`
      : "Filter: None";
    doc.text(`Generated: ${generatedAt}`, contentX, y);
    y += 18;
    doc.text(
      `Score: ${quizResult.score100}/100 | Wrong: ${quizResult.wrongCount} of ${quizResult.totalQuestions}`,
      contentX,
      y
    );
    y += 18;
    doc.text(filterLabel, contentX, y);
    y += 18;
    doc.setDrawColor(251, 146, 60);
    doc.line(contentX, y, pageWidth - contentX, y);
    y += 16;

    if (reportItems.length === 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text("No wrong answers found for the current filter.", contentX, y);
    } else {
      reportItems.forEach((item) => {
        const qLines = doc.splitTextToSize(
          `${item.questionNumber}. ${item.questionText}`,
          contentWidth
        );
        const yourAnswer = `Your answer: ${item.selectedLabel || "Not selected"}${
          item.selectedText ? ` - ${item.selectedText}` : ""
        }`;
        const correctAnswer = `Correct answer: ${item.correctLabel || "N/A"}${
          item.correctText ? ` - ${item.correctText}` : ""
        }`;
        const yourLines = doc.splitTextToSize(yourAnswer, contentWidth - 8);
        const correctLines = doc.splitTextToSize(correctAnswer, contentWidth - 8);
        const blockHeight =
          qLines.length * 14 + yourLines.length * 14 + correctLines.length * 14 + 28;

        ensureSpace(blockHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text(qLines, contentX, y);
        y += qLines.length * 14 + 4;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 38, 38);
        doc.text(yourLines, contentX + 6, y);
        y += yourLines.length * 14 + 2;

        doc.setTextColor(22, 163, 74);
        doc.text(correctLines, contentX + 6, y);
        y += correctLines.length * 14 + 8;

        doc.setDrawColor(253, 186, 116);
        doc.line(contentX, y, pageWidth - contentX, y);
        y += 12;
      });
    }

    const slug = (selectedQuiz.moduleCode || selectedQuiz.moduleName || "quiz")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    doc.save(`eduza-wrong-answers-${slug || "report"}.pdf`);
  };

  const getGradePoint = useCallback((grade) => {
    const found = gradingScale.find((item) => item.grade === grade);
    return found ? found.gpa : 0;
  }, [gradingScale]);

  const handleModuleChange = (id, field, value) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, [field]: value } : module
      )
    );
    setReportGenerated(false);
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: Date.now(),
        moduleName: "",
        credits: 3,
        grade: "A",
      },
    ]);
    setReportGenerated(false);
  };

  const removeModule = (id) => {
    if (modules.length === 1) return;
    setModules((prev) => prev.filter((module) => module.id !== id));
    setReportGenerated(false);
  };

  const validModules = useMemo(() => {
    return modules.filter(
      (m) => m.moduleName.trim() !== "" && Number(m.credits) > 0
    );
  }, [modules]);

  const summary = useMemo(() => {
    const totalCredits = validModules.reduce(
      (sum, module) => sum + Number(module.credits),
      0
    );

    const totalWeightedPoints = validModules.reduce(
      (sum, module) =>
        sum + Number(module.credits) * getGradePoint(module.grade),
      0
    );

    const gpa =
      totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

    return {
      totalModules: validModules.length,
      totalCredits,
      gpa,
    };
  }, [getGradePoint, validModules]);

  const getGpaLabel = (gpa) => {
    const value = Number(gpa);
    if (value >= 3.7) return "Excellent";
    if (value >= 3.3) return "Very Good";
    if (value >= 3.0) return "Good";
    if (value >= 2.0) return "Average";
    if (value > 0) return "Needs Improvement";
    return "No Data";
  };

  const getReportMessage = (gpa) => {
    const value = Number(gpa);

    if (value >= 3.7) {
      return "Outstanding academic performance. You are maintaining a very strong GPA and showing excellent consistency across your modules.";
    }
    if (value >= 3.3) {
      return "Very strong academic performance. You are doing well in most subjects and are close to excellent standing.";
    }
    if (value >= 3.0) {
      return "Good academic performance. You have a solid GPA, but there is still room to improve a few modules for a stronger result.";
    }
    if (value >= 2.0) {
      return "Average academic performance. Focus more on weaker modules and improve consistency to raise your GPA.";
    }
    if (value > 0) {
      return "Your GPA needs improvement. It is important to review difficult modules, practice regularly, and seek support when needed.";
    }
    return "No GPA report can be generated yet. Please enter valid module details first.";
  };

  const getStrengthModules = () => {
    return validModules.filter((m) => getGradePoint(m.grade) >= 3.3);
  };

  const getWeakModules = () => {
    return validModules.filter((m) => getGradePoint(m.grade) < 3.0);
  };

  const handleGenerateReport = () => {
    if (validModules.length === 0) {
      alert("Please add at least one valid module before generating the report.");
      return;
    }
    setReportGenerated(true);
  };

  const handleDownloadReport = () => {
    if (!reportGenerated) {
      alert("Please generate the report first.");
      return;
    }

    const reportDate = new Date().toLocaleString();

    const moduleLines = validModules
      .map(
        (module, index) =>
          `${index + 1}. ${module.moduleName} | Credits: ${module.credits} | Grade: ${module.grade} | Grade Point: ${getGradePoint(module.grade)}`
      )
      .join("\n");

    const strongLines =
      getStrengthModules().length > 0
        ? getStrengthModules().map((m) => `- ${m.moduleName} (${m.grade})`).join("\n")
        : "None";

    const weakLines =
      getWeakModules().length > 0
        ? getWeakModules().map((m) => `- ${m.moduleName} (${m.grade})`).join("\n")
        : "None";

    const reportText = `
EDUZA GPA REPORT
==============================

Generated On:
${reportDate}

Selected Mode:
${selectedMode}

Overall Summary:
- Total Modules: ${summary.totalModules}
- Total Credits: ${summary.totalCredits}
- GPA: ${summary.gpa}
- Performance Level: ${getGpaLabel(summary.gpa)}

Module Details:
${moduleLines}

Performance Report:
${getReportMessage(summary.gpa)}

Strong Modules:
${strongLines}

Modules That Need Improvement:
${weakLines}

Suggestions:
- Focus on low-grade modules first
- Improve time management and revision planning
- Practice quizzes and past papers
- Stay consistent with weekly study goals
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gpa-report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCardStyles = (accent, active) => {
    const styles = {
      orange: active
        ? "border-orange-400 bg-orange-50"
        : "border-orange-100 bg-white hover:border-orange-300",
      blue: active
        ? "border-blue-400 bg-blue-50"
        : "border-blue-100 bg-white hover:border-blue-300",
      purple: active
        ? "border-purple-400 bg-purple-50"
        : "border-purple-100 bg-white hover:border-purple-300",
      green: active
        ? "border-emerald-400 bg-emerald-50"
        : "border-emerald-100 bg-white hover:border-emerald-300",
    };

    return styles[accent];
  };

  const renderChart = () => {
    const width = 700;
    const height = 260;
    const padding = 40;
    const maxValue = 100;

    const points = selfCheckData
      .map((item, index) => {
        const x =
          padding +
          (index * (width - padding * 2)) / (selfCheckData.length - 1);
        const y =
          height - padding - (item.value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Self Check Progress</h3>
            <p className="mt-1 text-sm text-slate-500">
              Weekly confidence and performance trend
            </p>
          </div>
          <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
            Updated
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[280px] min-w-[680px] w-full"
          >
            <defs>
              <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((value) => {
              const y =
                height - padding - (value / maxValue) * (height - padding * 2);
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text x={10} y={y + 4} fontSize="12" fill="#64748b">
                    {value}
                  </text>
                </g>
              );
            })}

            {selfCheckData.map((item, index) => {
              const x =
                padding +
                (index * (width - padding * 2)) / (selfCheckData.length - 1);
              return (
                <text
                  key={item.label}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {item.label}
                </text>
              );
            })}

            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            <polygon
              fill="url(#lineFill)"
              points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            />

            {selfCheckData.map((item, index) => {
              const x =
                padding +
                (index * (width - padding * 2)) / (selfCheckData.length - 1);
              const y =
                height - padding - (item.value / maxValue) * (height - padding * 2);

              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="6" fill="#fff" stroke="#f97316" strokeWidth="3" />
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#ea580c"
                    fontWeight="700"
                  >
                    {item.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-8 py-10 shadow-[0_18px_40px_rgba(249,115,22,0.25)]">
          <div className="absolute right-[-50px] top-[-40px] h-52 w-52 rounded-full bg-white/10"></div>
          <div className="absolute bottom-[-60px] right-20 h-44 w-44 rounded-full bg-white/8"></div>

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg">
                📊
              </span>
              <span className="text-sm font-extrabold uppercase tracking-[0.14em]">
                Progress Tracker
              </span>
            </div>

            <h1 className="mb-3 text-3xl font-extrabold text-white md:text-5xl">
              Track Your Academic Progress
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-orange-50 md:text-base">
              Monitor your GPA, test your module knowledge, review your weekly self-check
              growth, and stay motivated with study streak badges.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`rounded-[24px] border p-6 text-left shadow-sm transition-all duration-200 ${getCardStyles(
                item.accent,
                activeCategory === item.id
              )}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-sm">
                  {item.icon}
                </div>
                <div className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-orange-600">
                  Available
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-slate-900">{item.title}</h2>
              <p className="mb-4 text-sm leading-7 text-slate-500">
                {item.description}
              </p>

              <div className="text-sm font-bold text-orange-600">
                Open Category →
              </div>
            </button>
          ))}
        </div>

        {activeCategory === "gpa" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      Calculate My GPA
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add your modules, credits, and grades to calculate GPA.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-sm font-bold text-slate-700">Select Mode</p>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {modeOptions.map((mode) => {
                      const modeKey = `${mode.title}-${mode.subtitle}`;
                      const isActive = selectedMode === modeKey;

                      return (
                        <button
                          key={modeKey}
                          onClick={() => {
                            setSelectedMode(modeKey);
                            setReportGenerated(false);
                          }}
                          className={`rounded-2xl border px-4 py-5 text-center transition ${
                            isActive
                              ? "border-purple-400 bg-purple-100 text-purple-900"
                              : "border-purple-200 bg-white text-slate-800 hover:bg-purple-50"
                          }`}
                        >
                          <div className="text-base font-extrabold">{mode.title}</div>
                          <div className="mt-1 text-sm text-slate-500">{mode.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="grid grid-cols-1 gap-3 md:grid-cols-12"
                    >
                      <div className="md:col-span-7">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {index === 0 ? "Module Name" : " "}
                        </label>
                        <input
                          type="text"
                          placeholder="Module name"
                          value={module.moduleName}
                          onChange={(e) =>
                            handleModuleChange(module.id, "moduleName", e.target.value)
                          }
                          className="w-full rounded-2xl border border-orange-200 bg-orange-50/40 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {index === 0 ? "Credits" : " "}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={module.credits}
                          onChange={(e) =>
                            handleModuleChange(module.id, "credits", e.target.value)
                          }
                          className="w-full rounded-2xl border border-orange-200 bg-orange-50/40 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {index === 0 ? "Grade" : " "}
                        </label>
                        <select
                          value={module.grade}
                          onChange={(e) =>
                            handleModuleChange(module.id, "grade", e.target.value)
                          }
                          className="w-full rounded-2xl border border-orange-200 bg-orange-50/40 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400"
                        >
                          {gradingScale.map((item) => (
                            <option key={item.grade} value={item.grade}>
                              {item.grade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end md:col-span-1">
                        <button
                          onClick={() => removeModule(module.id)}
                          className="flex h-[50px] w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-xl text-red-500 transition hover:bg-red-100"
                        >
                          ⊖
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={addModule}
                    className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
                  >
                    <span className="text-lg">⊕</span>
                    Add Module
                  </button>

                  <button
                    onClick={handleGenerateReport}
                    className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                  >
                    Generate Report
                  </button>

                  <button
                    onClick={handleDownloadReport}
                    className="rounded-2xl border border-orange-300 bg-white px-5 py-3 font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    Download Report
                  </button>
                </div>

                <div className="mt-8 rounded-[24px] border border-orange-100 bg-orange-50/50 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                      📋
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Summary</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-b border-orange-100 pb-5 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Total Modules</p>
                      <h5 className="mt-1 text-3xl font-extrabold text-slate-900">
                        {summary.totalModules}
                      </h5>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Credits</p>
                      <h5 className="mt-1 text-3xl font-extrabold text-slate-900">
                        {summary.totalCredits}
                      </h5>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Current GPA</p>
                      <h5 className="mt-1 text-lg font-semibold text-slate-900">
                        Result based on entered modules
                      </h5>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-5xl font-extrabold text-orange-600">
                        {summary.gpa}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {getGpaLabel(summary.gpa)}
                      </p>
                    </div>
                  </div>
                </div>

                {reportGenerated && (
                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        🧾
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">GPA Report</h4>
                    </div>

                    <div className="space-y-4 text-sm text-slate-700">
                      <div>
                        <span className="font-bold">Selected Mode:</span> {selectedMode}
                      </div>

                      <div>
                        <span className="font-bold">Performance Level:</span> {getGpaLabel(summary.gpa)}
                      </div>

                      <div>
                        <span className="font-bold">Report:</span>
                        <p className="mt-2 leading-7 text-slate-600">
                          {getReportMessage(summary.gpa)}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold">Strong Modules:</span>
                        {getStrengthModules().length > 0 ? (
                          <ul className="mt-2 list-disc pl-5 text-slate-600">
                            {getStrengthModules().map((module) => (
                              <li key={module.id}>
                                {module.moduleName} ({module.grade})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-slate-600">No strong modules identified yet.</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold">Modules Needing Improvement:</span>
                        {getWeakModules().length > 0 ? (
                          <ul className="mt-2 list-disc pl-5 text-slate-600">
                            {getWeakModules().map((module) => (
                              <li key={module.id}>
                                {module.moduleName} ({module.grade})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-slate-600">No weak modules identified.</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold">Suggestions:</span>
                        <ul className="mt-2 list-disc pl-5 leading-7 text-slate-600">
                          <li>Revise weak modules first.</li>
                          <li>Use weekly study planning for better consistency.</li>
                          <li>Practice quizzes and assessments regularly.</li>
                          <li>Keep tracking your progress every semester.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                    🪜
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Grading Scale</h3>
                </div>

                <div className="overflow-hidden rounded-2xl border border-orange-100">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-orange-50">
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          GPA
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradingScale.map((item, index) => (
                        <tr
                          key={item.grade}
                          className={`border-t border-orange-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-orange-50/30"
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {item.grade}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.gpa.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.marks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm leading-7 text-slate-600">
                    GPA = Total (Grade Point × Credits) / Total Credits
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "quiz" && (
          <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                📝
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Module Quiz</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quizzes created by lecturers for each database module.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {normalizedQuizModules.length === 0 ? (
                <div className="text-slate-500">No quizzes available</div>
              ) : (
                normalizedQuizModules.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-blue-100 bg-blue-50/40 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">
                        {item.moduleCode
                          ? `${item.moduleCode} - ${item.moduleName}`
                          : item.moduleName}
                      </h4>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                          item.status === "Completed"
                            ? "bg-blue-100 text-blue-600"
                            : item.status === "In Progress"
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-slate-600">Questions: {item.questionCount}</p>
                    <p className="mb-5 text-sm text-slate-600">Score: {item.score}%</p>

                    <button
                      onClick={() => handleStartQuiz(item.id)}
                      className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                    >
                      {String(selectedQuizId) === String(item.id)
                        ? "Close Quiz Paper"
                        : "Open Quiz Paper"}
                    </button>
                  </div>
                ))
              )}
            </div>

            {selectedQuiz ? (
              <div className="mt-6 rounded-[24px] border border-orange-100 bg-orange-50/50 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-xl font-extrabold text-slate-900">
                    {selectedQuiz.moduleCode
                      ? `${selectedQuiz.moduleCode} - ${selectedQuiz.moduleName}`
                      : selectedQuiz.moduleName}
                  </h4>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    {selectedQuiz.questionCount} Questions
                  </span>
                </div>

                {selectedQuiz.questions.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    This quiz only has summary data and no question details.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {selectedQuiz.questions.map((question, index) => (
                      <div
                        key={`${selectedQuiz.id}-${question.id || index}`}
                        className="rounded-2xl border border-orange-100 bg-white p-4"
                      >
                        <p className="mb-3 text-sm font-semibold text-slate-900">
                          {index + 1}. {question.text}
                        </p>

                        <div className="grid gap-2 md:grid-cols-2">
                          {(Array.isArray(question.options) ? question.options : []).map(
                            (option, optionIndex) => {
                              const label = OPTION_LABELS[optionIndex] || "";
                              const isSelected = quizAttemptAnswers[index] === label;

                              return (
                                <label
                                  key={`${question.id || index}-${label}`}
                                  className={`rounded-xl border px-3 py-2 text-sm ${
                                    isSelected
                                      ? "border-blue-300 bg-blue-50 text-blue-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`quiz-${selectedQuiz.id}-question-${index}`}
                                    value={label}
                                    checked={isSelected}
                                    onChange={() => handleSelectAnswer(index, label)}
                                    className="mr-2 accent-blue-600"
                                  />
                                  <span className="font-bold">{label}.</span> {option}
                                </label>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedQuiz.questions.length > 0 ? (
                  <div className="mt-5">
                    {quizValidationError ? (
                      <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {quizValidationError}
                      </p>
                    ) : null}

                    <button
                      onClick={handleSubmitQuiz}
                      className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : null}

                {quizResult ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <h5 className="text-lg font-extrabold text-emerald-800">Quiz Result</h5>
                    <p className="mt-2 text-sm text-emerald-700">
                      Score: <span className="font-extrabold">{quizResult.score100}/100</span>
                    </p>
                    <p className="text-sm text-emerald-700">
                      Correct: {quizResult.correctCount} / {quizResult.totalQuestions}
                    </p>
                    <p className="text-sm text-emerald-700">Wrong: {quizResult.wrongCount}</p>

                    <div className="mt-4">
                      <h6 className="text-sm font-bold text-slate-900">Wrong Answers</h6>
                      {quizResult.wrongAnswers.length === 0 ? (
                        <p className="mt-1 text-sm text-emerald-700">
                          No wrong answers. Great work!
                        </p>
                      ) : (
                        <div className="mt-2">
                          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
                            <input
                              type="text"
                              value={wrongAnswerSearchQuery}
                              onChange={(event) =>
                                setWrongAnswerSearchQuery(event.target.value)
                              }
                              placeholder="Search wrong answers..."
                              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 md:max-w-sm"
                            />

                            <button
                              onClick={handleDownloadWrongAnswersPdf}
                              className="rounded-xl border border-orange-300 bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                            >
                              Download Wrong Answers PDF
                            </button>
                          </div>

                          {filteredWrongAnswers.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              No wrong answers match your search.
                            </p>
                          ) : (
                            <div className="grid gap-3">
                              {filteredWrongAnswers.map((item) => (
                            <div
                              key={`wrong-${item.questionNumber}`}
                              className="rounded-xl border border-red-100 bg-white p-3"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {item.questionNumber}. {item.questionText}
                              </p>
                              <p className="mt-1 text-sm text-red-600">
                                Your answer: {item.selectedLabel || "Not selected"}
                                {item.selectedText ? ` - ${item.selectedText}` : ""}
                              </p>
                              <p className="text-sm text-emerald-700">
                                Correct answer: {item.correctLabel || "N/A"}
                                {item.correctText ? ` - ${item.correctText}` : ""}
                              </p>
                            </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {activeCategory === "selfcheck" && (
          <div className="space-y-6">
            {renderChart()}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-[24px] border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Current Confidence</p>
                <h4 className="mt-2 text-4xl font-extrabold text-purple-600">84%</h4>
              </div>

              <div className="rounded-[24px] border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Weekly Improvement</p>
                <h4 className="mt-2 text-4xl font-extrabold text-purple-600">+26%</h4>
              </div>

              <div className="rounded-[24px] border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Consistency Rate</p>
                <h4 className="mt-2 text-4xl font-extrabold text-purple-600">88%</h4>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "streak" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Current Streak</p>
              <h3 className="mt-2 text-5xl font-extrabold text-emerald-600">
                {streakData.currentStreak}
              </h3>
              <p className="mt-2 text-sm text-slate-600">days in a row</p>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Best Streak</p>
              <h3 className="mt-2 text-5xl font-extrabold text-emerald-600">
                {streakData.bestStreak}
              </h3>
              <p className="mt-2 text-sm text-slate-600">best record</p>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Study Days</p>
              <h3 className="mt-2 text-5xl font-extrabold text-emerald-600">
                {streakData.studyDays}
              </h3>
              <p className="mt-2 text-sm text-slate-600">completed days</p>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Badge Level</p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                {streakData.level}
              </h3>
              <p className="mt-2 text-sm text-slate-600">keep going strong</p>
            </div>

            <div className="md:col-span-2 xl:col-span-4 rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl">
                  🏅
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Study Streak Badge Unlocked
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  You are building strong study consistency. Keep completing your
                  daily tasks to unlock higher badges and maintain your momentum.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressTracker;