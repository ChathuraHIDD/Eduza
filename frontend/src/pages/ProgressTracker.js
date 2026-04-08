import React, { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { drawEduzaLogo } from "../utils/pdfBranding";

const QUIZ_STORAGE_KEY = "moduleQuizzes";
const SELF_CHECK_STORAGE_KEY = "moduleSelfChecks";
const QUIZ_ATTEMPTS_STORAGE_KEY = "quizAttempts";
const OPTION_LABELS = ["A", "B", "C", "D"];
const QUIZ_DURATION_SECONDS = 15 * 60;
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

const loadStoredQuizAttempts = () => {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      assessmentType: item.assessmentType || "quiz",
    }));
  } catch {
    return [];
  }
};

const generateAIRecommendations = (quizResult, selectedQuiz) => {
  if (!quizResult || !selectedQuiz) return [];

  const recommendations = [];
  const { checkedOutcomes, totalOutcomes, confidenceLevel, reflection } = quizResult;
  const masteryPercentage = (checkedOutcomes / totalOutcomes) * 100;

  // Confidence-based recommendations
  if (confidenceLevel <= 2) {
    recommendations.push({
      icon: "📖",
      title: "Build Foundation Knowledge",
      description: "Your confidence is low. Consider reviewing lecture notes and key concepts from the beginning before attempting more practice.",
      priority: "high",
    });
  }

  if (confidenceLevel === 3) {
    recommendations.push({
      icon: "💪",
      title: "Reinforce Understanding",
      description: "You're making progress! Work through more examples and practice problems to strengthen your grasp of these concepts.",
      priority: "medium",
    });
  }

  // Mastery-based recommendations
  if (masteryPercentage < 50) {
    recommendations.push({
      icon: "🎯",
      title: "Focus on Weak Areas",
      description: `You've mastered only ${Math.round(masteryPercentage)}% of outcomes. Identify which outcomes are challenging and create a targeted study plan for them.`,
      priority: "high",
    });
  } else if (masteryPercentage >= 50 && masteryPercentage < 80) {
    recommendations.push({
      icon: "🚀",
      title: "Push for Mastery",
      description: `You're at ${Math.round(masteryPercentage)}% mastery! Review the remaining outcomes and aim for complete mastery.`,
      priority: "medium",
    });
  } else if (masteryPercentage === 100) {
    recommendations.push({
      icon: "⭐",
      title: "Excellence Achieved",
      description: "Congratulations! You've mastered all learning outcomes. Now challenge yourself with advanced problems or help peers.",
      priority: "low",
    });
  }

  // Reflection-based recommendations
  if (reflection && reflection.toLowerCase().includes("confus")) {
    recommendations.push({
      icon: "❓",
      title: "Clarify Concepts",
      description: "You mentioned confusion in your reflection. Office hours or peer discussions might help clarify difficult topics.",
      priority: "high",
    });
  }

  if (reflection && (reflection.toLowerCase().includes("need") || reflection.toLowerCase().includes("practice"))) {
    recommendations.push({
      icon: "✍️",
      title: "Practice More",
      description: "More practice is key! Work through additional exercises and create study guides to reinforce learning.",
      priority: "medium",
    });
  }

  if (!reflection || reflection.trim().length < 20) {
    recommendations.push({
      icon: "💭",
      title: "Reflect Deeply",
      description: "Detailed reflections help identify learning gaps. Next time, write more specific thoughts about what you learned and struggled with.",
      priority: "low",
    });
  }

  return recommendations;
};

function ProgressTracker() {
  const categories = [
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
      description: "Access lecturer-created self-checks and repeat them anytime.",
      icon: "📚",
      accent: "purple",
    },
    {
      id: "measure",
      title: "Measure",
      description: "Track your study confidence and performance using progress graphs.",
      icon: "📈",
      accent: "orange",
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

  const [activeCategory, setActiveCategory] = useState("quiz");
  const [selectedMode, setSelectedMode] = useState("Custom-Add your own");
  const [modules, setModules] = useState([
    { id: 1, moduleName: "", credits: 3, grade: "A" },
  ]);
  const [quizModules] = useState(loadStoredQuizzes);
  const [selfCheckModules] = useState(loadStoredSelfChecks);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizAttemptAnswers, setQuizAttemptAnswers] = useState({});
  const [quizValidationError, setQuizValidationError] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [wrongAnswerSearchQuery, setWrongAnswerSearchQuery] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("");
  const [reflection, setReflection] = useState("");
  const [quizAttempts, setQuizAttempts] = useState(loadStoredQuizAttempts);
  const [selfCheckQuizFilter, setSelfCheckQuizFilter] = useState("all");
  const [quizTimeLeft, setQuizTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isQuizTimerRunning, setIsQuizTimerRunning] = useState(false);
  const [quizTimeoutMessage, setQuizTimeoutMessage] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

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
        type: quiz.type || "quiz",
        moduleName: quiz.moduleName || "Unnamed Module",
        moduleCode: quiz.moduleCode || "",
        questionCount: questions.length || Number(quiz.questions) || 0,
        questions,
      };
    });
  }, [quizModules]);

  const normalizedSelfCheckModules = useMemo(() => {
    return selfCheckModules.map((item) => {
      const questions = Array.isArray(item.questions) ? item.questions : [];
      return {
        ...item,
        type: item.type || "selfcheck",
        moduleName: item.moduleName || "Unnamed Module",
        moduleCode: item.moduleCode || "",
        questionCount: questions.length || Number(item.questions) || 0,
        questions,
      };
    });
  }, [selfCheckModules]);

  const allAssessments = useMemo(() => {
    return [...normalizedQuizModules, ...normalizedSelfCheckModules];
  }, [normalizedQuizModules, normalizedSelfCheckModules]);

  const selectedQuiz = useMemo(() => {
    if (!selectedQuizId) return null;
    return (
      allAssessments.find((quiz) => String(quiz.id) === String(selectedQuizId)) ||
      null
    );
  }, [allAssessments, selectedQuizId]);

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
      setSelfCheckQuizFilter("all");
      setIsQuizTimerRunning(false);
      setQuizTimeLeft(QUIZ_DURATION_SECONDS);
      setConfidenceLevel("");
      setReflection("");
      return;
    }

    setSelectedQuizId(quizId);
    setQuizAttemptAnswers({});
    setQuizValidationError("");
    setQuizResult(null);
    setWrongAnswerSearchQuery("");
    setQuizTimeoutMessage("");
    setQuizTimeLeft(QUIZ_DURATION_SECONDS);
    setIsQuizTimerRunning(true);
    setConfidenceLevel("");
    setReflection("");
  };

  useEffect(() => {
    if (!selectedQuiz || !isQuizTimerRunning) return undefined;

    const timerId = window.setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          setSelectedQuizId(null);
          setQuizAttemptAnswers({});
          setQuizValidationError("");
          setQuizResult(null);
          setWrongAnswerSearchQuery("");
          setIsQuizTimerRunning(false);
          setQuizTimeoutMessage(
            "Time is up. Quiz closed automatically after 15 minutes."
          );
          return QUIZ_DURATION_SECONDS;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isQuizTimerRunning, selectedQuiz]);

  const timerDisplay = useMemo(() => {
    const minutes = Math.floor(quizTimeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (quizTimeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [quizTimeLeft]);

  const handleSelectAnswer = (questionIndex, optionLabel) => {
    setQuizAttemptAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLabel,
    }));
    setQuizValidationError("");
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz) {
      setQuizValidationError("No assessment selected.");
      return;
    }

    if (selectedQuiz.type === "selfcheck") {
      // Validation for self-checks
      if (!confidenceLevel) {
        setQuizValidationError("Please select your confidence level.");
        return;
      }

      if (!reflection.trim()) {
        setQuizValidationError("Please provide a reflection on your learning.");
        return;
      }

      // Calculate progress score based on checked outcomes and confidence
      const totalOutcomes = selectedQuiz.learningOutcomes?.length || 0;
      const checkedOutcomes = Object.values(quizAttemptAnswers).filter(Boolean).length;
      const checklistScore = totalOutcomes > 0 ? (checkedOutcomes / totalOutcomes) * 100 : 0;
      const confidenceScore = (parseInt(confidenceLevel) / 5) * 100;
      const overallScore = Math.round((checklistScore + confidenceScore) / 2);

      const quizId = String(selectedQuiz.id);
      const attemptNumber =
        quizAttempts.filter((attempt) => String(attempt.quizId) === quizId).length + 1;
      const submittedAt = new Date().toISOString();

      const newAttempt = {
        id: `${quizId}-${Date.now()}`,
        quizId,
        moduleCode: selectedQuiz.moduleCode || "",
        moduleName: selectedQuiz.moduleName || "Unnamed Module",
        assessmentType: "selfcheck",
        attemptNumber,
        score100: overallScore,
        confidenceLevel: parseInt(confidenceLevel),
        reflection: reflection.trim(),
        checkedOutcomes,
        totalOutcomes,
        submittedAt,
      };

      const nextAttempts = [...quizAttempts, newAttempt];
      setQuizAttempts(nextAttempts);
      localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(nextAttempts));

      setQuizResult({
        totalOutcomes,
        checkedOutcomes,
        confidenceLevel: parseInt(confidenceLevel),
        reflection: reflection.trim(),
        score100: overallScore,
        attemptNumber,
        submittedAt,
      });
      setQuizValidationError("");
      setIsQuizTimerRunning(false);
      return;
    }

    // Original quiz validation and submission logic
    if (!Array.isArray(selectedQuiz.questions) || selectedQuiz.questions.length === 0) {
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

    const quizId = String(selectedQuiz.id);
    const attemptNumber =
      quizAttempts.filter((attempt) => String(attempt.quizId) === quizId).length + 1;
    const submittedAt = new Date().toISOString();

    const newAttempt = {
      id: `${quizId}-${Date.now()}`,
      quizId,
      moduleCode: selectedQuiz.moduleCode || "",
      moduleName: selectedQuiz.moduleName || "Unnamed Module",
      assessmentType: selectedQuiz.type || "quiz",
      attemptNumber,
      score100,
      correctCount,
      wrongCount: wrongAnswers.length,
      totalQuestions: selectedQuiz.questions.length,
      submittedAt,
    };

    const nextAttempts = [...quizAttempts, newAttempt];
    setQuizAttempts(nextAttempts);
    localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(nextAttempts));

    setQuizResult({
      totalQuestions: selectedQuiz.questions.length,
      correctCount,
      wrongCount: wrongAnswers.length,
      score100,
      wrongAnswers,
      attemptNumber,
      submittedAt,
    });
    setWrongAnswerSearchQuery("");
    setQuizValidationError("");
    setIsQuizTimerRunning(false);
  };

  const handleSubmitConfidence = (level) => {
    if (!selectedQuiz || !quizResult) return;

    const updatedAttempts = quizAttempts.map((attempt) => {
      if (
        String(attempt.quizId) === String(selectedQuiz.id) &&
        attempt.attemptNumber === quizResult.attemptNumber
      ) {
        return { ...attempt, confidenceLevel: level };
      }
      return attempt;
    });

    setQuizAttempts(updatedAttempts);
    localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(updatedAttempts));
    setConfidenceLevel(level);
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

  const selfCheckQuizOptions = useMemo(() => {
    const map = new Map();
    quizAttempts.forEach((attempt) => {
      if (!attempt) return;
      const id = String(attempt.quizId || "");
      if (!id || map.has(id)) return;
      const label = attempt.moduleCode
        ? `${attempt.moduleCode} - ${attempt.moduleName}`
        : attempt.moduleName || "Unnamed Module";
      map.set(id, { id, label });
    });
    return Array.from(map.values());
  }, [quizAttempts]);

  const selfCheckAttemptSeries = useMemo(() => {
    return quizAttempts
      .filter((attempt) => {
        if (!attempt || typeof attempt.score100 !== "number") return false;
        if (selfCheckQuizFilter === "all") return true;
        return String(attempt.quizId) === String(selfCheckQuizFilter);
      })
      .sort(
        (a, b) =>
          new Date(a.submittedAt || 0).getTime() -
          new Date(b.submittedAt || 0).getTime()
      );
  }, [quizAttempts, selfCheckQuizFilter]);

  const displayedSelfCheckSeries = useMemo(() => {
    return selfCheckAttemptSeries.slice(-12).map((attempt) => ({
      ...attempt,
      label: `R${attempt.attemptNumber || 1}`,
      value: Number(attempt.score100 || 0),
    }));
  }, [selfCheckAttemptSeries]);

  const selfCheckStats = useMemo(() => {
    if (selfCheckAttemptSeries.length === 0) {
      return { latest: 0, average: 0, progress: 0, best: 0 };
    }

    const scores = selfCheckAttemptSeries.map((attempt) =>
      Number(attempt.score100 || 0)
    );
    const latest = scores[scores.length - 1];
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const best = Math.max(...scores);
    const progress = scores.length > 1 ? latest - scores[0] : 0;

    return { latest, average, progress, best };
  }, [selfCheckAttemptSeries]);

  const learningAnalytics = useMemo(() => {
    if (quizAttempts.length === 0) {
      return {
        overallProgress: 0,
        averageScore: 0,
        averageConfidence: 0,
        totalAttempts: 0,
        weakAreas: [],
        strongAreas: [],
        recommendation: "Start taking quizzes and self-checks to track your progress.",
      };
    }

    const scores = quizAttempts.map((a) => Number(a.score100 || 0));
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    const confidenceScores = {
      "not-understood": 0,
      "partially-understood": 0.33,
      "mostly-understood": 0.67,
      "fully-confident": 1,
    };

    const confidences = quizAttempts
      .filter((a) => a.confidenceLevel)
      .map((a) => confidenceScores[a.confidenceLevel] || 0);
    const averageConfidence = confidences.length > 0
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : 0.5; // default if no confidence

    const overallProgress = Math.round((averageScore / 100 + averageConfidence) / 2 * 100);

    // Group by module for weak/strong areas
    const moduleStats = {};
    quizAttempts.forEach((attempt) => {
      const module = attempt.moduleName || "Unknown";
      if (!moduleStats[module]) moduleStats[module] = [];
      moduleStats[module].push(Number(attempt.score100 || 0));
    });

    const moduleAverages = Object.entries(moduleStats).map(([module, scores]) => ({
      module,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));

    const weakAreas = moduleAverages.filter((m) => m.average < 50);
    const strongAreas = moduleAverages.filter((m) => m.average > 75);

    let recommendation = "Keep practicing to improve your understanding.";
    if (overallProgress < 50) {
      recommendation = "Focus on revision of weak topics and take more self-checks.";
    } else if (overallProgress < 75) {
      recommendation = "You're making good progress. Continue with more practice.";
    } else {
      recommendation = "Excellent work! You're ready to move to advanced topics.";
    }

    return {
      overallProgress,
      averageScore: Math.round(averageScore),
      averageConfidence: Math.round(averageConfidence * 100),
      totalAttempts: quizAttempts.length,
      weakAreas,
      strongAreas,
      recommendation,
    };
  }, [quizAttempts]);

  const handleDownloadWrongAnswersPdf = async () => {
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

    const drawPageFrame = async () => {
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(1.6);
      doc.rect(border, border, pageWidth - border * 2, pageHeight - border * 2);

      doc.setFillColor(249, 115, 22);
      doc.rect(border + 8, border + 8, pageWidth - (border + 8) * 2, 64, "F");

      doc.setTextColor(255, 255, 255);
      const hasLogo = await drawEduzaLogo(doc, border + 16, border + 16, 66, 44);
      if (!hasLogo) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("EDUZA", border + 20, border + 48);
      }

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

    const ensureSpace = async (requiredHeight) => {
      if (y + requiredHeight <= pageHeight - 52) return;
      doc.addPage();
      await drawPageFrame();
      y = 132;
    };

    await drawPageFrame();

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
      for (const item of reportItems) {
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

        await ensureSpace(blockHeight);

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
      }
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

    if (displayedSelfCheckSeries.length === 0) {
      return (
        <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-2 text-2xl font-bold text-slate-900">Assessment Progress</div>
          <p className="text-sm text-slate-500">
            No assessment attempts yet. Complete quizzes and self-checks to track marks
            progress here.
          </p>
        </div>
      );
    }

    const xDivider = Math.max(1, displayedSelfCheckSeries.length - 1);

    const points = displayedSelfCheckSeries
      .map((item, index) => {
        const x =
          padding +
          (index * (width - padding * 2)) / xDivider;
        const y =
          height - padding - (item.value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Assessment Progress</h3>
            <p className="mt-1 text-sm text-slate-500">
              Quiz and self-check marks progress trend
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

            {displayedSelfCheckSeries.map((item, index) => {
              const x =
                padding +
                (index * (width - padding * 2)) / xDivider;
              return (
                <text
                  key={`${item.label}-${index}`}
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

            {displayedSelfCheckSeries.map((item, index) => {
              const x =
                padding +
                (index * (width - padding * 2)) / xDivider;
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
        <div className="relative mb-8 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#ff6a00] via-[#f25c05] to-[#d5541b] px-8 py-8 shadow-[0_18px_40px_rgba(249,115,22,0.25)]">
          <div className="absolute right-[-40px] top-[-40px] h-52 w-52 rounded-full bg-white/10"></div>
          <div className="absolute bottom-[-55px] right-20 h-44 w-44 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-3 rounded-[14px] bg-white/15 px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg">
                📊
              </span>
              <span className="text-xs font-black uppercase tracking-[0.16em]">
                Progress Tracker
              </span>
            </div>

            <h1 className="mb-3 text-3xl font-extrabold text-white">
              Track Your Academic Progress
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/90">
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

            {quizTimeoutMessage ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {quizTimeoutMessage}
              </div>
            ) : null}

            {selectedQuiz && selectedQuiz.type !== "selfcheck" ? (
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

                <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Timer starts when you open the quiz.
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-extrabold ${
                      quizTimeLeft <= 60
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {timerDisplay}
                  </span>
                </div>

                {selectedQuiz.type === "selfcheck" ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                      <h4 className="text-lg font-bold text-purple-800 mb-3">Learning Outcomes Assessment</h4>
                      <p className="text-sm text-purple-700 mb-4">
                        Check off the learning outcomes you feel confident about mastering.
                      </p>

                      <div className="space-y-3">
                        {(selectedQuiz.learningOutcomes || []).map((outcome, index) => (
                          <div key={`outcome-${outcome.id}`} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`outcome-${outcome.id}`}
                              checked={quizAttemptAnswers[index] || false}
                              onChange={(e) => handleSelectAnswer(index, e.target.checked)}
                              className="mt-1 h-4 w-4 accent-purple-600"
                            />
                            <label
                              htmlFor={`outcome-${outcome.id}`}
                              className="text-sm text-slate-700 cursor-pointer"
                            >
                              {outcome.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                      <h4 className="text-lg font-bold text-purple-800 mb-3">Confidence Rating</h4>
                      <p className="text-sm text-purple-700 mb-4">
                        How confident do you feel about this topic after the self-check?
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { value: "1", label: "Very Low", color: "bg-red-100 text-red-700 border-red-300" },
                          { value: "2", label: "Low", color: "bg-orange-100 text-orange-700 border-orange-300" },
                          { value: "3", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                          { value: "4", label: "High", color: "bg-lime-100 text-lime-700 border-lime-300" },
                          { value: "5", label: "Very High", color: "bg-green-100 text-green-700 border-green-300" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`rounded-xl border px-3 py-3 text-sm font-semibold text-center cursor-pointer transition ${
                              confidenceLevel === option.value
                                ? option.color
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="confidence"
                              value={option.value}
                              checked={confidenceLevel === option.value}
                              onChange={(e) => setConfidenceLevel(e.target.value)}
                              className="hidden"
                            />
                            <div>{option.label}</div>
                            <div className="text-xs opacity-75">{option.value}/5</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                      <h4 className="text-lg font-bold text-purple-800 mb-3">Reflection</h4>
                      <p className="text-sm text-purple-700 mb-4">
                        Write a brief reflection on what you learned and areas for improvement.
                      </p>

                      <textarea
                        value={reflection || ""}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="What did you learn? What concepts do you still need to work on?"
                        rows={4}
                        className="w-full rounded-xl border border-purple-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
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

                {selectedQuiz.type === "selfcheck" ? (
                  <div className="mt-5">
                    {quizValidationError ? (
                      <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {quizValidationError}
                      </p>
                    ) : null}

                    <button
                      onClick={handleSubmitQuiz}
                      className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-600"
                    >
                      Submit Self Check
                    </button>
                  </div>
                ) : selectedQuiz.questions.length > 0 ? (
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
                    <h5 className="text-lg font-extrabold text-emerald-800">
                      {selectedQuiz.type === "selfcheck" ? "Self Check Result" : "Quiz Result"}
                    </h5>
                    <p className="mt-2 text-sm text-emerald-700">
                      Score: <span className="font-extrabold">{quizResult.score100}/100</span>
                    </p>
                    <p className="text-sm text-emerald-700">
                      Repeat: {quizResult.attemptNumber}
                    </p>
                    {selectedQuiz.type === "selfcheck" ? (
                      <>
                        <p className="text-sm text-emerald-700">
                          Learning Outcomes Mastered: {quizResult.checkedOutcomes} / {quizResult.totalOutcomes}
                        </p>
                        <p className="text-sm text-emerald-700">
                          Confidence Level: {quizResult.confidenceLevel}/5
                        </p>
                        <div className="mt-3">
                          <h6 className="text-sm font-bold text-slate-900">Reflection</h6>
                          <p className="mt-1 text-sm text-emerald-700 italic">
                            "{quizResult.reflection}"
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {activeCategory === "selfcheck" && (
          <div className="rounded-[28px] border border-purple-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                📚
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Self Check</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Access lecturer-created self-checks and repeat them anytime.
                </p>
              </div>
            </div>

            {normalizedSelfCheckModules.length === 0 ? (
              <div className="rounded-[24px] border border-purple-100 bg-purple-50/60 p-6 text-sm text-purple-700">
                No self-checks are available yet. Ask your lecturer to create one, or check back later.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {normalizedSelfCheckModules.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-purple-100 bg-purple-50/40 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">
                        {item.moduleCode
                          ? `${item.moduleCode} - ${item.moduleName}`
                          : item.moduleName}
                      </h4>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                        {item.status}
                      </span>
                    </div>

                    <p className="mb-4 text-sm text-slate-600">
                      {item.type === "selfcheck"
                        ? `Self-assessment with ${item.learningOutcomes?.length || 0} learning outcomes.`
                        : `Repeatable self-check with ${item.questionCount} questions.`}
                    </p>

                    <button
                      onClick={() => handleStartQuiz(item.id)}
                      className="rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-600"
                    >
                      {String(selectedQuizId) === String(item.id)
                        ? "Close Self Check"
                        : "Open Self Check"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedQuiz && selectedQuiz.type === "selfcheck" ? (
              <div className="mt-6 rounded-[24px] border border-purple-100 bg-purple-50/50 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-xl font-extrabold text-slate-900">
                    {selectedQuiz.moduleCode
                      ? `${selectedQuiz.moduleCode} - ${selectedQuiz.moduleName}`
                      : selectedQuiz.moduleName}
                  </h4>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                    {selectedQuiz.learningOutcomes?.length || selectedQuiz.questionCount} Outcomes
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl border border-purple-200 bg-white p-4">
                    <h4 className="text-lg font-bold text-purple-800 mb-3">Learning Outcomes Assessment</h4>
                    <p className="text-sm text-purple-700 mb-4">
                      Check off the learning outcomes you feel confident about mastering.
                    </p>
                    <div className="space-y-3">
                      {(selectedQuiz.learningOutcomes || []).map((outcome, index) => {
                        const outcomeId = outcome.id || index;
                        return (
                          <div key={`outcome-${index}`} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`outcome-${outcomeId}`}
                              checked={quizAttemptAnswers[index] || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectAnswer(index, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 h-4 w-4 accent-purple-600 cursor-pointer"
                            />
                            <label
                              htmlFor={`outcome-${outcomeId}`}
                              className="text-sm text-slate-700 cursor-pointer"
                              onClick={() => {
                                const checkbox = document.getElementById(`outcome-${outcomeId}`);
                                if (checkbox) {
                                  checkbox.checked = !checkbox.checked;
                                  handleSelectAnswer(index, checkbox.checked);
                                }
                              }}
                            >
                              {outcome.text}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-white p-4">
                    <h4 className="text-lg font-bold text-purple-800 mb-3">Confidence Rating</h4>
                    <p className="text-sm text-purple-700 mb-4">
                      How confident do you feel about this topic after the self-check?
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { value: "1", label: "Very Low", color: "bg-red-100 text-red-700 border-red-300" },
                        { value: "2", label: "Low", color: "bg-orange-100 text-orange-700 border-orange-300" },
                        { value: "3", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                        { value: "4", label: "High", color: "bg-lime-100 text-lime-700 border-lime-300" },
                        { value: "5", label: "Very High", color: "bg-green-100 text-green-700 border-green-300" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold text-center cursor-pointer transition ${
                            confidenceLevel === option.value
                              ? option.color
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="confidence"
                            value={option.value}
                            checked={confidenceLevel === option.value}
                            onChange={(e) => setConfidenceLevel(e.target.value)}
                            className="hidden"
                          />
                          <div>{option.label}</div>
                          <div className="text-xs opacity-75">{option.value}/5</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-white p-4">
                    <h4 className="text-lg font-bold text-purple-800 mb-3">Reflection</h4>
                    <p className="text-sm text-purple-700 mb-4">
                      Write a brief reflection on what you learned and areas for improvement.
                    </p>

                    <textarea
                      value={reflection || ""}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What did you learn? What concepts do you still need to work on?"
                      rows={4}
                      className="w-full rounded-xl border border-purple-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                    />
                  </div>

                  {quizValidationError ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                      {quizValidationError}
                    </p>
                  ) : null}

                  <button
                    onClick={handleSubmitQuiz}
                    className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-600"
                  >
                    Submit Self Check
                  </button>

                  {quizResult ? (
                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                      <style>{`
                        @keyframes slideInUp {
                          from {
                            opacity: 0;
                            transform: translateY(20px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                        @keyframes fadeIn {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes pulse {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.05); }
                        }
                        @keyframes glow {
                          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                          50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                        }
                        .ai-header {
                          animation: fadeIn 0.6s ease-out;
                        }
                        .ai-suggestion {
                          animation: slideInUp 0.5s ease-out backwards;
                        }
                        .ai-icon {
                          animation: pulse 2s ease-in-out infinite;
                        }
                        .ai-suggestion:hover {
                          animation: glow 0.6s ease-out;
                        }
                      `}</style>
                      {selectedQuiz && selectedQuiz.type === "selfcheck" && quizResult ? (() => {
                        const recommendations = generateAIRecommendations(quizResult, selectedQuiz);
                        return recommendations.length > 0 ? (
                          <div>
                            <div className="ai-header mb-5 flex items-center gap-3">
                              <span className="ai-icon inline-block text-3xl">🤖</span>
                              <div>
                                <h5 className="text-lg font-bold text-emerald-900">AI-Powered Improvement Suggestions</h5>
                                <p className="text-xs text-emerald-700">Personalized recommendations based on your performance</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {recommendations.map((rec, idx) => (
                                <div
                                  key={idx}
                                  className={`ai-suggestion rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                                    rec.priority === "high"
                                      ? "border-red-300 bg-white shadow-sm hover:shadow-red-200/50"
                                      : rec.priority === "medium"
                                      ? "border-yellow-300 bg-white shadow-sm hover:shadow-yellow-200/50"
                                      : "border-blue-300 bg-white shadow-sm hover:shadow-blue-200/50"
                                  }`}
                                  style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                  <div className="flex items-start gap-4">
                                    <span className="text-2xl">{rec.icon}</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-slate-900">{rec.title}</p>
                                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                                      <div className="mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold">
                                        {rec.priority === "high" && <span className="text-red-600">● High Priority</span>}
                                        {rec.priority === "medium" && <span className="text-yellow-600">● Medium Priority</span>}
                                        {rec.priority === "low" && <span className="text-blue-600">● Low Priority</span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })() : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeCategory === "measure" && (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="rounded-[24px] border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">🔍 Assessment Filter</h4>
                  <p className="text-sm text-slate-600">
                    Select an assessment to see repeat attempts and marks progress.
                  </p>
                </div>
                <select
                  value={selfCheckQuizFilter}
                  onChange={(event) => setSelfCheckQuizFilter(event.target.value)}
                  className="rounded-xl border-2 border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-orange-500 focus:shadow-lg transition"
                >
                  <option value="all">All Quizzes</option>
                  {selfCheckQuizOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart */}
            {renderChart()}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[24px] border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm hover:shadow-lg transition hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Latest Mark</p>
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-3xl font-extrabold text-purple-600 mb-2">
                  {selfCheckStats.latest}%
                </h4>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selfCheckStats.latest}%` }}></div>
                </div>
              </div>

              <div className="rounded-[24px] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm hover:shadow-lg transition hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Average Mark</p>
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-3xl font-extrabold text-blue-600 mb-2">
                  {selfCheckStats.average}%
                </h4>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selfCheckStats.average}%` }}></div>
                </div>
              </div>

              <div className="rounded-[24px] border-2 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-sm hover:shadow-lg transition hover:scale-105"
                style={{ borderColor: selfCheckStats.progress >= 0 ? '#22c55e' : '#ef4444' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Progress</p>
                  <span className="text-2xl">{selfCheckStats.progress >= 0 ? '📈' : '📉'}</span>
                </div>
                <h4 className={`text-3xl font-extrabold mb-2 ${selfCheckStats.progress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selfCheckStats.progress >= 0 ? "+" : ""}
                  {selfCheckStats.progress}%
                </h4>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: `${Math.min(Math.abs(selfCheckStats.progress), 100)}%` }}></div>
                </div>
              </div>

              <div className="rounded-[24px] border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-6 shadow-sm hover:shadow-lg transition hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Best Mark</p>
                  <span className="text-2xl">⭐</span>
                </div>
                <h4 className="text-3xl font-extrabold text-amber-600 mb-2">
                  {selfCheckStats.best}%
                </h4>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selfCheckStats.best}%` }}></div>
                </div>
              </div>
            </div>

            {/* Learning Analytics */}
            <div className="rounded-[24px] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-2">📊 Learning Analytics</h4>
              <p className="text-sm text-slate-600 mb-6">
                Comprehensive analysis of your learning progress and recommendations.
              </p>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[20px] border-2 border-blue-300 bg-white/80 backdrop-blur p-4 hover:shadow-lg transition">
                  <style>{`
                    @keyframes countUp {
                      from { opacity: 0; transform: scale(0.5); }
                      to { opacity: 1; transform: scale(1); }
                    }
                    .metric-circle {
                      animation: countUp 0.8s ease-out;
                    }
                  `}</style>
                  <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold metric-circle shadow-lg">
                    {learningAnalytics.overallProgress}%
                  </div>
                  <p className="text-center text-sm font-bold text-slate-900">Overall Progress</p>
                  <p className="text-center text-xs text-slate-600 mt-1">Combined score & confidence</p>
                </div>

                <div className="rounded-[20px] border-2 border-green-300 bg-white/80 backdrop-blur p-4 hover:shadow-lg transition">
                  <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold metric-circle shadow-lg">
                    {learningAnalytics.averageScore}%
                  </div>
                  <p className="text-center text-sm font-bold text-slate-900">Avg Score</p>
                  <p className="text-center text-xs text-slate-600 mt-1">Across all attempts</p>
                </div>

                <div className="rounded-[20px] border-2 border-yellow-300 bg-white/80 backdrop-blur p-4 hover:shadow-lg transition">
                  <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold metric-circle shadow-lg">
                    {learningAnalytics.averageConfidence}%
                  </div>
                  <p className="text-center text-sm font-bold text-slate-900">Confidence</p>
                  <p className="text-center text-xs text-slate-600 mt-1">Self-assessed level</p>
                </div>

                <div className="rounded-[20px] border-2 border-purple-300 bg-white/80 backdrop-blur p-4 hover:shadow-lg transition">
                  <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-3xl font-bold metric-circle shadow-lg">
                    {learningAnalytics.totalAttempts}
                  </div>
                  <p className="text-center text-sm font-bold text-slate-900">Total Attempts</p>
                  <p className="text-center text-xs text-slate-600 mt-1">Quizzes & self-checks</p>
                </div>
              </div>

              {/* Weak and Strong Areas */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-[20px] border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50 p-5 hover:shadow-lg transition">
                  <h5 className="text-sm font-bold text-red-800 mb-1">🔴 Weak Areas</h5>
                  <p className="text-xs text-red-600 mb-3">Focus on improving these modules</p>
                  {learningAnalytics.weakAreas.length === 0 ? (
                    <p className="text-sm text-red-700 font-semibold">✅ No weak areas identified!</p>
                  ) : (
                    <div className="space-y-2">
                      {learningAnalytics.weakAreas.map((area) => (
                        <div key={area.module}>
                          <div className="flex justify-between mb-1">
                            <p className="text-xs font-semibold text-red-800">{area.module}</p>
                            <p className="text-xs font-bold text-red-600">{Math.round(area.average)}%</p>
                          </div>
                          <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${Math.round(area.average)}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[20px] border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-5 hover:shadow-lg transition">
                  <h5 className="text-sm font-bold text-green-800 mb-1">🟢 Strong Areas</h5>
                  <p className="text-xs text-green-600 mb-3">Maintain excellence in these modules</p>
                  {learningAnalytics.strongAreas.length === 0 ? (
                    <p className="text-sm text-green-700 font-semibold">Start taking assessments to identify strengths!</p>
                  ) : (
                    <div className="space-y-2">
                      {learningAnalytics.strongAreas.map((area) => (
                        <div key={area.module}>
                          <div className="flex justify-between mb-1">
                            <p className="text-xs font-semibold text-green-800">{area.module}</p>
                            <p className="text-xs font-bold text-green-600">{Math.round(area.average)}%</p>
                          </div>
                          <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${Math.round(area.average)}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-[20px] border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 p-5">
                <h5 className="text-sm font-bold text-cyan-800 mb-2">💡 AI Recommendation</h5>
                <p className="text-sm text-cyan-700 leading-relaxed">{learningAnalytics.recommendation}</p>
              </div>
            </div>

            {/* Assessment History */}
            <div className="rounded-[24px] border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-2">📋 Assessment Repeat History</h4>
              <p className="text-sm text-slate-600 mb-4">
                All assessment repeats are stored with marks and timestamps.
              </p>

              {selfCheckAttemptSeries.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-6 text-center">
                  <p className="text-sm text-orange-700 font-semibold">No attempts recorded yet. Start with a quiz or self-check!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {[...selfCheckAttemptSeries].reverse().map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className="rounded-[16px] border-2 border-orange-200 bg-white p-4 hover:shadow-md transition hover:border-orange-300"
                      style={{ animation: `slideInUp 0.3s ease-out ${idx * 0.05}s backwards` }}
                    >
                      <style>{`
                        @keyframes slideInUp {
                          from { opacity: 0; transform: translateY(10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}</style>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {attempt.moduleCode
                              ? `${attempt.moduleCode} - ${attempt.moduleName}`
                              : attempt.moduleName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Repeat {attempt.attemptNumber} • {new Date(attempt.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="inline-block rounded-lg bg-orange-100 px-3 py-2">
                              <p className="text-sm font-extrabold text-orange-600">{attempt.score100}%</p>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold text-slate-700">{attempt.correctCount}/{attempt.totalQuestions}</p>
                            <p className="text-slate-500">correct</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeCategory === "streak" && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Current Streak</p>
                <h3 className="mt-2 text-5xl font-extrabold text-emerald-600">
                  {streakData.currentStreak}
                </h3>
                <p className="mt-2 text-sm text-slate-600">days in a row</p>
                <div className="mt-3 h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Best Streak</p>
                <h3 className="mt-2 text-5xl font-extrabold text-amber-600">
                  {streakData.bestStreak}
                </h3>
                <p className="mt-2 text-sm text-slate-600">best record</p>
              </div>

              <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Study Days</p>
                <h3 className="mt-2 text-5xl font-extrabold text-blue-600">
                  {streakData.studyDays}
                </h3>
                <p className="mt-2 text-sm text-slate-600">completed days</p>
              </div>

              <div className="rounded-[28px] border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Badge Level</p>
                <h3 className="mt-2 text-3xl font-extrabold text-purple-600">
                  {streakData.level}
                </h3>
                <p className="mt-2 text-sm text-slate-600">keep going strong</p>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Weekly Activity</h3>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                  const activity = Math.floor(Math.random() * 5);
                  const colors = [
                    "bg-slate-100",
                    "bg-green-200",
                    "bg-green-400",
                    "bg-green-500",
                    "bg-green-600",
                  ];
                  return (
                    <div key={day} className="text-center">
                      <div className={`rounded-lg h-12 w-full mb-2 ${colors[activity]} hover:scale-110 transition`}></div>
                      <p className="text-xs font-semibold text-slate-600">{day}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-500">Darker shade = more study activity</p>
            </div>

            {/* Time Spent & Subjects */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">⏱️ Time This Week</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">Self Checks</p>
                      <p className="text-sm font-bold text-blue-600">4h 30m</p>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">Quizzes</p>
                      <p className="text-sm font-bold text-purple-600">2h 15m</p>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-amber-600">Total: 6h 45m</p>
              </div>

              <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Top Subjects</h3>
                <div className="space-y-3">
                  {[
                    { name: "Database Design", pct: 85 },
                    { name: "SQL Queries", pct: 72 },
                    { name: "Normalization", pct: 68 },
                  ].map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-700">{subject.name}</p>
                        <p className="text-sm font-bold text-green-600">{subject.pct}%</p>
                      </div>
                      <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${subject.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Badge Section */}
            <div className="md:col-span-2 xl:col-span-4 rounded-[28px] border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-8 shadow-lg">
              <style>{`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes rotate {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .badge-bounce {
                  animation: bounce 2s ease-in-out infinite;
                }
                .badge-spin {
                  animation: rotate 20s linear infinite;
                }
              `}</style>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-7xl badge-bounce shadow-2xl">
                  🏅
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  Study Streak Badge Unlocked
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  You are building strong study consistency. Keep completing your daily tasks to unlock higher badges and maintain your momentum.
                </p>
              </div>
            </div>

            {/* Rewards Catalog */}
            <div className="rounded-[28px] border border-purple-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🎁 Reward Catalog</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-4 hover:bg-purple-100 transition cursor-pointer">
                  <p className="text-2xl mb-2">📜</p>
                  <p className="font-semibold text-sm text-slate-900">Study Certificate</p>
                  <p className="text-xs text-slate-600 mt-1">Unlock at 30-day streak</p>
                </div>
                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-4 hover:bg-purple-100 transition cursor-pointer">
                  <p className="text-2xl mb-2">💡</p>
                  <p className="font-semibold text-sm text-slate-900">Study Tips Bundle</p>
                  <p className="text-xs text-slate-600 mt-1">Unlock at 60-day streak</p>
                </div>
                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-4 hover:bg-purple-100 transition cursor-pointer">
                  <p className="text-2xl mb-2">⭐</p>
                  <p className="font-semibold text-sm text-slate-900">Premium Features</p>
                  <p className="text-xs text-slate-600 mt-1">Unlock at 100-day streak</p>
                </div>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🔮 AI Performance Insights</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">📈 Streak Prediction</p>
                  <p className="text-xs text-slate-600">Based on current patterns, you're <span className="font-bold text-green-600">87% likely</span> to maintain your streak this week.</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">⏰ Best Study Time</p>
                  <p className="text-xs text-slate-600">You're most productive between <span className="font-bold">7-9 PM</span>. Peak focus of the day!</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">📚 Recommended Module</p>
                  <p className="text-xs text-slate-600">Focus on <span className="font-bold">SQL Optimization</span> next. Your confidence is low here.</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">🚀 Growth Rate</p>
                  <p className="text-xs text-slate-600">You're improving at <span className="font-bold">+15% per week</span>. Excellent progress!</p>
                </div>
              </div>
            </div>

            {/* Recovery Guide */}
            <div className="rounded-[28px] border border-red-100 bg-red-50/50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">💪 If Your Streak Breaks...</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>✅ <span className="font-semibold">Start small:</span> Begin with just 15 minutes of study to rebuild momentum</p>
                <p>✅ <span className="font-semibold">Pick your best time:</span> Study during your peak focus hours (7-9 PM)</p>
                <p>✅ <span className="font-semibold">Easy wins first:</span> Start with modules you're confident in</p>
                <p>✅ <span className="font-semibold">Track progress:</span> Use self-checks to stay motivated</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressTracker;