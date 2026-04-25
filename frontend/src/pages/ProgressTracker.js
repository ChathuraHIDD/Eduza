import React, { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { drawEduzaLogo } from "../utils/pdfBranding";
import {
  createProgressAttempt,
  listProgressAssessments,
  listProgressAttempts,
  updateProgressAttempt,
} from "../utils/progressTrackerApi";

const QUIZ_STORAGE_KEY = "moduleQuizzes";
const SELF_CHECK_STORAGE_KEY = "moduleSelfChecks";
const QUIZ_ATTEMPTS_STORAGE_KEY = "quizAttempts";
const OPTION_LABELS = ["A", "B", "C", "D"];
const QUIZ_DURATION_SECONDS = 15 * 60;
const MAX_QUIZ_ATTEMPTS = 5;
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
  const [quizModules, setQuizModules] = useState(loadStoredQuizzes);
  const [selfCheckModules, setSelfCheckModules] = useState(loadStoredSelfChecks);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizAttemptAnswers, setQuizAttemptAnswers] = useState({});
  const [quizValidationError, setQuizValidationError] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [wrongAnswerSearchQuery, setWrongAnswerSearchQuery] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("");
  const [reflection, setReflection] = useState("");
  const [quizAttempts, setQuizAttempts] = useState(loadStoredQuizAttempts);
  const [selfCheckQuizFilter, setSelfCheckQuizFilter] = useState("");
  const [quizTimeLeft, setQuizTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isQuizTimerRunning, setIsQuizTimerRunning] = useState(false);
  const [quizTimeoutMessage, setQuizTimeoutMessage] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const toLocalDayKey = useCallback((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getPublishedTimestamp = useCallback((item) => {
    const candidates = [
      item?.publishedAt,
      item?.publishDate,
      item?.createdAt,
      item?.updatedAt,
      item?.date,
    ];

    for (const value of candidates) {
      if (!value) continue;
      const timestamp = new Date(value).getTime();
      if (!Number.isNaN(timestamp)) return timestamp;
    }

    return 0;
  }, []);

  const dayKeyToIndex = useCallback((dayKey) => {
    const [year, month, day] = dayKey.split("-").map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }, []);

  const formatMinutes = useCallback((totalMinutes) => {
    const safe = Math.max(0, Number(totalMinutes || 0));
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    return `${hours}h ${minutes}m`;
  }, []);

  const to12HourLabel = useCallback((hour24) => {
    const normalized = ((Number(hour24) % 24) + 24) % 24;
    const suffix = normalized >= 12 ? "PM" : "AM";
    const hour12 = normalized % 12 || 12;
    return `${hour12} ${suffix}`;
  }, []);

  const streakData = useMemo(() => {
    const dayKeys = new Set(
      quizAttempts
        .map((attempt) => toLocalDayKey(attempt?.submittedAt))
        .filter(Boolean)
    );

    if (dayKeys.size === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        studyDays: 0,
        level: "Starter Badge",
      };
    }

    const dayIndexes = Array.from(dayKeys)
      .map(dayKeyToIndex)
      .sort((a, b) => a - b);

    let bestStreak = 1;
    let running = 1;
    for (let i = 1; i < dayIndexes.length; i += 1) {
      if (dayIndexes[i] === dayIndexes[i - 1] + 1) {
        running += 1;
      } else {
        running = 1;
      }
      if (running > bestStreak) {
        bestStreak = running;
      }
    }

    const latestIndex = dayIndexes[dayIndexes.length - 1];
    const now = new Date();
    const todayIndex = Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
    );

    let currentStreak = 0;
    if (todayIndex - latestIndex <= 1) {
      currentStreak = 1;
      for (let i = dayIndexes.length - 2; i >= 0; i -= 1) {
        if (dayIndexes[i] === latestIndex - currentStreak) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }

    let level = "Starter Badge";
    if (currentStreak >= 30) level = "Diamond Badge";
    else if (currentStreak >= 14) level = "Gold Badge";
    else if (currentStreak >= 7) level = "Silver Badge";
    else if (currentStreak >= 3) level = "Bronze Badge";

    return {
      currentStreak,
      bestStreak,
      studyDays: dayIndexes.length,
      level,
    };
  }, [dayKeyToIndex, quizAttempts, toLocalDayKey]);

  const weeklyActivity = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const dayOffset = (now.getDay() + 6) % 7; // convert Sun=0..Sat=6 to Mon=0..Sun=6
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - dayOffset);

    const attemptCountByDay = new Map();
    quizAttempts.forEach((attempt) => {
      const dayKey = toLocalDayKey(attempt?.submittedAt);
      if (!dayKey) return;
      attemptCountByDay.set(dayKey, (attemptCountByDay.get(dayKey) || 0) + 1);
    });

    return labels.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dayKey = toLocalDayKey(date);
      const attempts = attemptCountByDay.get(dayKey) || 0;
      return {
        label,
        attempts,
        intensity: Math.min(attempts, 4),
      };
    });
  }, [quizAttempts, toLocalDayKey]);

  const weeklyTimeStats = useMemo(() => {
    const now = new Date();
    const dayOffset = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - dayOffset);

    const weekAttempts = quizAttempts.filter((attempt) => {
      const submitted = new Date(attempt?.submittedAt || "");
      if (Number.isNaN(submitted.getTime())) return false;
      return submitted >= weekStart;
    });

    const quizCount = weekAttempts.filter(
      (attempt) => (attempt.assessmentType || "quiz") === "quiz"
    ).length;
    const selfCheckCount = weekAttempts.filter(
      (attempt) => (attempt.assessmentType || "quiz") === "selfcheck"
    ).length;

    const quizMinutes = quizCount * 15;
    const selfCheckMinutes = selfCheckCount * 10;
    const totalMinutes = quizMinutes + selfCheckMinutes;

    return {
      quizCount,
      selfCheckCount,
      quizMinutes,
      selfCheckMinutes,
      totalMinutes,
      quizPct: totalMinutes > 0 ? Math.round((quizMinutes / totalMinutes) * 100) : 0,
      selfCheckPct: totalMinutes > 0 ? Math.round((selfCheckMinutes / totalMinutes) * 100) : 0,
    };
  }, [quizAttempts]);

  const modulePerformance = useMemo(() => {
    const moduleStats = new Map();

    quizAttempts.forEach((attempt) => {
      if (!attempt) return;
      const name = attempt.moduleCode
        ? `${attempt.moduleCode} - ${attempt.moduleName || "Unnamed Module"}`
        : attempt.moduleName || "";
      if (!name) return;

      const current = moduleStats.get(name) || { name, total: 0, count: 0 };
      current.total += Number(attempt.score100 || 0);
      current.count += 1;
      moduleStats.set(name, current);
    });

    return Array.from(moduleStats.values())
      .map((item) => ({
        name: item.name,
        average: Math.max(0, Math.min(100, Math.round(item.total / Math.max(item.count, 1)))),
        attempts: item.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [quizAttempts]);

  const topSubjects = useMemo(() => {
    if (modulePerformance.length > 0) {
      return modulePerformance.slice(0, 3).map((item) => ({
        name: item.name,
        pct: item.average,
      }));
    }

    const fallbackModules = [
      ...quizModules.map((item) => ({
        name: item.moduleCode
          ? `${item.moduleCode} - ${item.moduleName || "Unnamed Module"}`
          : item.moduleName || "",
      })),
      ...selfCheckModules.map((item) => ({
        name: item.moduleCode
          ? `${item.moduleCode} - ${item.moduleName || "Unnamed Module"}`
          : item.moduleName || "",
      })),
    ]
      .filter((item) => item.name)
      .reduce((acc, item) => {
        if (!acc.some((entry) => entry.name === item.name)) {
          acc.push({ name: item.name, pct: 0 });
        }
        return acc;
      }, [])
      .slice(0, 3);

    return fallbackModules;
  }, [modulePerformance, quizModules, selfCheckModules]);

  const aiInsights = useMemo(() => {
    const activeDaysInWeek = weeklyActivity.filter((day) => day.attempts > 0).length;
    const streakLikelihood = Math.min(
      98,
      Math.max(
        20,
        Math.round(
          (activeDaysInWeek / 7) * 65 +
            Math.min(streakData.currentStreak, 14) * 2.2
        )
      )
    );

    const hourFrequency = new Map();
    quizAttempts.forEach((attempt) => {
      const date = new Date(attempt?.submittedAt || "");
      if (Number.isNaN(date.getTime())) return;
      const hour = date.getHours();
      hourFrequency.set(hour, (hourFrequency.get(hour) || 0) + 1);
    });

    let peakHour = null;
    let peakCount = 0;
    hourFrequency.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    const bestStudyTime =
      peakHour === null
        ? "No activity data yet"
        : `${to12HourLabel(peakHour)} - ${to12HourLabel((peakHour + 2) % 24)}`;

    const weakestModule =
      modulePerformance.length > 0
        ? [...modulePerformance].sort((a, b) => a.average - b.average)[0]
        : null;

    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    const currentOffset = (now.getDay() + 6) % 7;
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    startOfCurrentWeek.setDate(now.getDate() - currentOffset);

    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const currentWeekScores = [];
    const previousWeekScores = [];

    quizAttempts.forEach((attempt) => {
      const submitted = new Date(attempt?.submittedAt || "");
      if (Number.isNaN(submitted.getTime())) return;
      const score = Number(attempt.score100 || 0);
      if (submitted >= startOfCurrentWeek) {
        currentWeekScores.push(score);
      } else if (submitted >= startOfPreviousWeek && submitted < startOfCurrentWeek) {
        previousWeekScores.push(score);
      }
    });

    const currentAvg = currentWeekScores.length
      ? currentWeekScores.reduce((sum, score) => sum + score, 0) / currentWeekScores.length
      : 0;
    const previousAvg = previousWeekScores.length
      ? previousWeekScores.reduce((sum, score) => sum + score, 0) / previousWeekScores.length
      : 0;
    const growthRate = Math.round(currentAvg - previousAvg);

    return {
      streakLikelihood,
      bestStudyTime,
      weakestModule,
      growthRate,
    };
  }, [modulePerformance, quizAttempts, streakData.currentStreak, to12HourLabel, weeklyActivity]);

  useEffect(() => {
    let isMounted = true;

    const loadFromDatabase = async () => {
      try {
        const [quizData, selfCheckData, attemptData] = await Promise.all([
          listProgressAssessments("quiz"),
          listProgressAssessments("selfcheck"),
          listProgressAttempts(),
        ]);

        if (!isMounted) return;

        const normalizedQuiz = quizData.map((item) => ({
          ...item,
          id: String(item.id || item._id),
          type: "quiz",
          questions: Array.isArray(item.questions) ? item.questions : [],
        }));

        const normalizedSelfCheck = selfCheckData.map((item) => ({
          ...item,
          id: String(item.id || item._id),
          type: "selfcheck",
          learningOutcomes: Array.isArray(item.learningOutcomes)
            ? item.learningOutcomes
            : [],
        }));

        setQuizModules(normalizedQuiz);
        setSelfCheckModules(normalizedSelfCheck);
        setQuizAttempts(attemptData);

        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(normalizedQuiz));
        localStorage.setItem(SELF_CHECK_STORAGE_KEY, JSON.stringify(normalizedSelfCheck));
        localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(attemptData));
      } catch {
        // Keep local fallback data when API is unavailable.
      }
    };

    loadFromDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuizModules = useMemo(() => {
    return quizModules
      .map((quiz) => {
        const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
        return {
          ...quiz,
          type: quiz.type || "quiz",
          moduleName: quiz.moduleName || "Unnamed Module",
          moduleCode: quiz.moduleCode || "",
          questionCount: questions.length || Number(quiz.questions) || 0,
          questions,
        };
      })
      .sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a));
  }, [getPublishedTimestamp, quizModules]);

  const normalizedSelfCheckModules = useMemo(() => {
    return selfCheckModules
      .map((item) => {
        const questions = Array.isArray(item.questions) ? item.questions : [];
        return {
          ...item,
          type: item.type || "selfcheck",
          moduleName: item.moduleName || "Unnamed Module",
          moduleCode: item.moduleCode || "",
          questionCount: questions.length || Number(item.questions) || 0,
          questions,
        };
      })
      .sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a));
  }, [getPublishedTimestamp, selfCheckModules]);

  const isAssessmentOpen = useCallback(
    (assessmentId) => String(selectedQuizId) === String(assessmentId),
    [selectedQuizId]
  );

  const getDisplayedAssessmentStatus = useCallback(
    (item) => {
      if (isAssessmentOpen(item.id) && item.status !== "Completed") {
        return "Started";
      }

      return item.status || "Not Started";
    },
    [isAssessmentOpen]
  );

  const getDisplayedAssessmentStatusStyle = useCallback((status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#dbeafe",
          color: "#2563eb",
        };
      case "Started":
      case "In Progress":
        return {
          background: "#ffedd5",
          color: "#9a3412",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
        };
    }
  }, []);

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

  const getAssessmentAttemptCount = useCallback(
    (assessmentId, assessmentType) => {
      return quizAttempts.filter((attempt) => {
        return (
          String(attempt.quizId) === String(assessmentId) &&
          (attempt.assessmentType || "quiz") === assessmentType
        );
      }).length;
    },
    [quizAttempts]
  );

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

  const quizAttemptsOnly = useMemo(() => {
    return quizAttempts
      .filter((attempt) => {
        if ((attempt.assessmentType || "quiz") !== "quiz") return false;
        const attemptNumber = Number(attempt.attemptNumber || 0);
        if (!Number.isFinite(attemptNumber) || attemptNumber <= 0) return true;
        return attemptNumber <= MAX_QUIZ_ATTEMPTS;
      })
      .sort(
        (a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime()
      );
  }, [quizAttempts]);

  const quizAttemptsByAssessment = useMemo(() => {
    const map = new Map();

    quizAttemptsOnly.forEach((attempt) => {
      const assessmentId = String(attempt.quizId || "");
      if (!assessmentId) return;

      if (!map.has(assessmentId)) {
        map.set(assessmentId, []);
      }

      map.get(assessmentId).push(attempt);
    });

    return map;
  }, [quizAttemptsOnly]);

  const quizProgressOptions = useMemo(() => {
    const options = Array.from(quizAttemptsByAssessment.entries()).map(([id, attempts]) => {
      const latestAttempt = attempts[attempts.length - 1];
      const label = latestAttempt?.moduleCode
        ? `${latestAttempt.moduleCode} - ${latestAttempt.moduleName}`
        : latestAttempt?.moduleName || "Unnamed Quiz";

      return { id, label };
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [quizAttemptsByAssessment]);

  useEffect(() => {
    if (!selfCheckQuizFilter && quizProgressOptions.length > 0) {
      setSelfCheckQuizFilter(quizProgressOptions[0].id);
    }
  }, [quizProgressOptions, selfCheckQuizFilter]);

  const effectiveQuizFilter = useMemo(() => {
    if (selfCheckQuizFilter === "all") return "all";
    if (selfCheckQuizFilter) return selfCheckQuizFilter;
    return quizProgressOptions[0]?.id || "all";
  }, [quizProgressOptions, selfCheckQuizFilter]);

  const quizProgressSeries = useMemo(() => {
    const source =
      effectiveQuizFilter === "all"
        ? quizAttemptsOnly
        : quizAttemptsOnly.filter((attempt) => String(attempt.quizId) === String(effectiveQuizFilter));

    return source.slice(-12).map((attempt) => ({
      ...attempt,
      label:
        effectiveQuizFilter === "all"
          ? `${attempt.moduleCode || attempt.moduleName || "Quiz"} R${attempt.attemptNumber || 1}`
          : `R${attempt.attemptNumber || 1}`,
      value: Number(attempt.score100 || 0),
    }));
  }, [effectiveQuizFilter, quizAttemptsOnly]);

  const quizProgressModuleSeries = useMemo(() => {
    if (effectiveQuizFilter !== "all") {
      return [];
    }

    const moduleSeries = new Map();

    quizAttemptsOnly.forEach((attempt) => {
      const moduleKey = String(attempt.moduleCode || attempt.moduleName || attempt.quizId || "module");
      if (!moduleSeries.has(moduleKey)) {
        moduleSeries.set(moduleKey, []);
      }
      moduleSeries.get(moduleKey).push(attempt);
    });

    return Array.from(moduleSeries.entries()).map(([moduleKey, attempts]) => ({
      key: moduleKey,
      label: attempts[0]?.moduleCode
        ? `${attempts[0].moduleCode} - ${attempts[0].moduleName}`
        : attempts[0]?.moduleName || moduleKey,
      values: attempts.slice(-8).map((attempt) => ({
        id: attempt.id,
        value: Number(attempt.score100 || 0),
        label: `R${attempt.attemptNumber || 1}`,
      })),
    }));
  }, [effectiveQuizFilter, quizAttemptsOnly]);

  const analyticsAttempts = useMemo(() => {
    if (effectiveQuizFilter === "all") return quizAttemptsOnly;
    return quizAttemptsOnly.filter((attempt) => String(attempt.quizId) === String(effectiveQuizFilter));
  }, [effectiveQuizFilter, quizAttemptsOnly]);

  const analyticsAttemptsByAssessment = useMemo(() => {
    const map = new Map();
    analyticsAttempts.forEach((attempt) => {
      const key = String(attempt.quizId || "");
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(attempt);
    });
    return map;
  }, [analyticsAttempts]);

  const quizRepeatAnalytics = useMemo(() => {
    const attemptedQuizzes = Array.from(analyticsAttemptsByAssessment.entries());

    if (attemptedQuizzes.length === 0) {
      return {
        totalAttempts: 0,
        repeatQuizzes: 0,
        improvingQuizzes: 0,
        averageRepeatGain: 0,
        latestScore: 0,
        averageScore: 0,
        bestScore: 0,
        recommendation: "Start repeating quizzes to see progress trends here.",
      };
    }

    const allScores = analyticsAttempts.map((attempt) => Number(attempt.score100 || 0));
    const repeatAnalyses = attemptedQuizzes.map(([, attempts]) => {
      const firstScore = Number(attempts[0]?.score100 || 0);
      const latestScore = Number(attempts[attempts.length - 1]?.score100 || 0);
      return {
        firstScore,
        latestScore,
        gain: latestScore - firstScore,
        attemptsCount: attempts.length,
      };
    });

    const improvingQuizzes = repeatAnalyses.filter((item) => item.gain > 0).length;
    const repeatQuizzes = repeatAnalyses.filter((item) => item.attemptsCount > 1).length;
    const averageRepeatGain = repeatAnalyses.length
      ? Math.round(
          repeatAnalyses.reduce((sum, item) => sum + item.gain, 0) / repeatAnalyses.length
        )
      : 0;
    const latestScore = allScores[allScores.length - 1] || 0;
    const averageScore = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    );
    const bestScore = Math.max(...allScores);

    let recommendation = "Repeat quizzes regularly to strengthen mastery.";
    if (improvingQuizzes === 0 && repeatQuizzes > 0) {
      recommendation = "Some repeated quizzes are not improving yet. Review weak topics and try again.";
    } else if (averageRepeatGain > 0) {
      recommendation = "Your repeat attempts are improving. Keep revising and use the next attempts strategically.";
    } else if (averageRepeatGain < 0) {
      recommendation = "Scores are slipping across repeats. Focus on the topics you are missing before reattempting.";
    }

    return {
      totalAttempts: analyticsAttempts.length,
      repeatQuizzes,
      improvingQuizzes,
      averageRepeatGain,
      latestScore,
      averageScore,
      bestScore,
      recommendation,
    };
  }, [analyticsAttempts, analyticsAttemptsByAssessment]);

  const measureProgressDelta = useMemo(() => {
    if (quizProgressSeries.length < 2) return 0;
    const first = Number(quizProgressSeries[0].value || 0);
    const latest = Number(quizProgressSeries[quizProgressSeries.length - 1].value || 0);
    return latest - first;
  }, [quizProgressSeries]);

  const quizModuleSummaries = useMemo(() => {
    return Array.from(analyticsAttemptsByAssessment.entries()).map(([quizId, attempts]) => {
      const firstAttempt = attempts[0] || {};
      const latestAttempt = attempts[attempts.length - 1] || {};
      const moduleName = latestAttempt.moduleCode
        ? `${latestAttempt.moduleCode} - ${latestAttempt.moduleName}`
        : latestAttempt.moduleName || firstAttempt.moduleName || "Unnamed Quiz";
      const firstScore = Number(firstAttempt.score100 || 0);
      const latestScore = Number(latestAttempt.score100 || 0);
      const gain = latestScore - firstScore;

      return {
        quizId,
        moduleName,
        attemptsCount: attempts.length,
        firstScore,
        latestScore,
        gain,
        isImproving: gain > 0,
      };
    });
  }, [analyticsAttemptsByAssessment]);

  const selectedQuizAttemptCount = useMemo(() => {
    if (!selectedQuiz || selectedQuiz.type !== "quiz") return 0;
    return getAssessmentAttemptCount(selectedQuiz.id, "quiz");
  }, [getAssessmentAttemptCount, selectedQuiz]);

  const selectedQuizIsLocked =
    selectedQuiz && selectedQuiz.type === "quiz" && selectedQuizAttemptCount >= MAX_QUIZ_ATTEMPTS;

  const handleStartQuiz = (quizId) => {
    if (String(selectedQuizId) === String(quizId)) {
      setSelectedQuizId(null);
      setQuizAttemptAnswers({});
      setQuizValidationError("");
      setQuizResult(null);
      setWrongAnswerSearchQuery("");
      setIsQuizTimerRunning(false);
      setQuizTimeLeft(QUIZ_DURATION_SECONDS);
      setConfidenceLevel("");
      setReflection("");
      return;
    }

    const attemptCount = getAssessmentAttemptCount(quizId, "quiz");
    if (attemptCount >= MAX_QUIZ_ATTEMPTS) {
      setQuizTimeoutMessage(`This quiz is locked after ${MAX_QUIZ_ATTEMPTS} attempts.`);
      setQuizValidationError(`You have already used all ${MAX_QUIZ_ATTEMPTS} quiz attempts.`);
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

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) {
      setQuizValidationError("No assessment selected.");
      return;
    }

    if (selectedQuiz.type === "quiz") {
      const attemptCount = getAssessmentAttemptCount(selectedQuiz.id, "quiz");
      if (attemptCount >= MAX_QUIZ_ATTEMPTS) {
        setQuizValidationError(`This quiz is locked after ${MAX_QUIZ_ATTEMPTS} attempts.`);
        setIsQuizTimerRunning(false);
        return;
      }
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

      let storedAttempt = newAttempt;
      try {
        storedAttempt = await createProgressAttempt({
          ...newAttempt,
          assessmentId: selectedQuiz.id,
          quizId: quizId,
          moduleId: selectedQuiz.moduleId || "",
        });
      } catch {
        // Keep local fallback if API call fails.
      }

      const nextAttempts = [...quizAttempts, storedAttempt];
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

    let storedAttempt = newAttempt;
    try {
      storedAttempt = await createProgressAttempt({
        ...newAttempt,
        assessmentId: selectedQuiz.id,
        quizId,
        moduleId: selectedQuiz.moduleId || "",
      });
    } catch {
      // Keep local fallback if API call fails.
    }

    const nextAttempts = [...quizAttempts, storedAttempt];
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

  const handleSubmitConfidence = async (level) => {
    if (!selectedQuiz || !quizResult) return;

    let updatedAttemptId = "";
    const updatedAttempts = quizAttempts.map((attempt) => {
      if (
        String(attempt.quizId) === String(selectedQuiz.id) &&
        attempt.attemptNumber === quizResult.attemptNumber
      ) {
        updatedAttemptId = attempt.id || attempt._id || "";
        return { ...attempt, confidenceLevel: level };
      }
      return attempt;
    });

    if (updatedAttemptId) {
      try {
        await updateProgressAttempt(updatedAttemptId, { confidenceLevel: level });
      } catch {
        // Keep local state update if API call fails.
      }
    }

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
      label:
        selfCheckQuizFilter === "all"
          ? `${attempt.moduleCode || attempt.moduleName || "Assessment"} R${attempt.attemptNumber || 1}`
          : `R${attempt.attemptNumber || 1}`,
      value: Number(attempt.score100 || 0),
    }));
  }, [selfCheckAttemptSeries, selfCheckQuizFilter]);

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
    const normalizedValue =
      field === "credits"
        ? Math.max(0, Number(value) || 0)
        : value;

    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, [field]: normalizedValue } : module
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
    const height = 300;
    const padding = 40;
    const bottomPadding = 64;
    const maxValue = 100;
    const moduleColors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];

    if (quizProgressSeries.length === 0) {
      return (
        <div className="progress-measure-chart rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-2 text-2xl font-bold text-slate-900">Quiz Progress Trend</div>
          <p className="text-sm text-slate-500">
            No quiz attempts yet. Complete a quiz to track repeat progress here.
          </p>
        </div>
      );
    }

    const singleSeriesPoints = quizProgressSeries
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(1, quizProgressSeries.length - 1);
        const y = height - bottomPadding - (item.value / maxValue) * (height - padding - bottomPadding);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="progress-measure-chart rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
        <div className="progress-measure-chart-header mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Quiz Progress Trend</h3>
            <p className="mt-1 text-sm text-slate-500">
              Quiz repeat scores and improvement trend over attempts
            </p>
          </div>
          <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
            Updated
          </div>
        </div>

        {effectiveQuizFilter === "all" && quizProgressModuleSeries.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {quizProgressModuleSeries.map((series, index) => (
              <div
                key={series.key}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: moduleColors[index % moduleColors.length],
                    display: "inline-block",
                  }}
                />
                {series.label}
              </div>
            ))}
          </div>
        ) : null}

        <div className="progress-measure-chart-body">
          <div className="progress-measure-chart-scroll overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="progress-measure-chart-svg h-[320px] min-w-[680px] w-full"
          >
            <defs>
              <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((value) => {
              const y =
                height - bottomPadding - (value / maxValue) * (height - padding - bottomPadding);
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

            {effectiveQuizFilter === "all" && quizProgressModuleSeries.length > 0 ? (
              quizProgressModuleSeries.map((series, seriesIndex) => {
                const seriesPoints = series.values
                  .map((item, index) => {
                    const x = padding + (index * (width - padding * 2)) / Math.max(1, series.values.length - 1);
                    const y = height - bottomPadding - (item.value / maxValue) * (height - padding - bottomPadding);
                    return `${x},${y}`;
                  })
                  .join(" ");

                return (
                  <g key={series.key}>
                    <polyline
                      fill="none"
                      stroke={moduleColors[seriesIndex % moduleColors.length]}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={seriesPoints}
                    />
                    {series.values.map((item, index) => {
                      const x = padding + (index * (width - padding * 2)) / Math.max(1, series.values.length - 1);
                      const y = height - bottomPadding - (item.value / maxValue) * (height - padding - bottomPadding);

                      return (
                        <g key={`${series.key}-${item.id || index}`}>
                          <circle cx={x} cy={y} r="6" fill="#fff" stroke={moduleColors[seriesIndex % moduleColors.length]} strokeWidth="3" />
                          <text
                            x={x}
                            y={y - 14}
                            textAnchor="middle"
                            fontSize="12"
                            fill={moduleColors[seriesIndex % moduleColors.length]}
                            fontWeight="700"
                          >
                            {item.value}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })
            ) : (
              <>
                {quizProgressSeries.map((item, index) => {
                  const x = padding + (index * (width - padding * 2)) / Math.max(1, quizProgressSeries.length - 1);
                  const shortLabel = item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label;
                  return (
                    <text
                      key={item.id || `${item.quizId}-${item.attemptNumber}-${index}`}
                      x={x}
                      y={height - 18}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#64748b"
                    >
                      {shortLabel}
                    </text>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={singleSeriesPoints}
                />

                <polygon
                  fill="url(#lineFill)"
                  points={`${padding},${height - bottomPadding} ${singleSeriesPoints} ${width - padding},${height - bottomPadding}`}
                />

                {quizProgressSeries.map((item, index) => {
                  const x = padding + (index * (width - padding * 2)) / Math.max(1, quizProgressSeries.length - 1);
                  const y = height - bottomPadding - (item.value / maxValue) * (height - padding - bottomPadding);

                  return (
                    <g key={item.id || `${item.quizId}-${item.attemptNumber}-${index}`}>
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
              </>
            )}
          </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1040, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
          borderRadius: "24px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          minHeight: "165px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "30px",
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
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.14)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "14px",
            width: "fit-content",
            marginBottom: "14px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            📊
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Progress Tracker
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 10px 0",
            color: "#fff",
            fontSize: "28px",
            fontWeight: "800",
            position: "relative",
            zIndex: 1,
          }}
        >
          Track Your Academic Progress
        </h1>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.92)",
            fontSize: "14px",
            lineHeight: "1.7",
            maxWidth: "760px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Monitor your GPA, test your module knowledge, review your weekly self-check
          growth, and stay motivated with study streak badges.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: 24,
        }}
      >
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`flex h-full min-h-[190px] flex-col rounded-[18px] border text-left transition-all duration-200 hover:-translate-y-0.5 ${getCardStyles(
                item.accent,
                activeCategory === item.id
              )}`}
              style={{
                padding: "18px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div
                  className="flex items-center justify-center bg-slate-50 text-3xl"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  className="shrink-0 bg-orange-100 text-orange-600"
                  style={{
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Available
                </div>
              </div>

              <h2 className="mb-3 text-xl font-bold leading-7 text-slate-900">{item.title}</h2>
              <p className="mb-6 text-sm leading-7 text-slate-500">
                {item.description}
              </p>

              <div className="mt-auto pt-6 text-sm font-bold text-orange-600">
                Open Category →
              </div>
            </button>
          ))}
      </div>


        {activeCategory === "quiz" && (
          <div
            style={{
              borderRadius: 24,
              border: "1px solid #f5d0fe",
              background: "#fff",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  background: "#dbeafe",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                }}
              >
                📝
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>Module Quiz</h3>
                <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
                  Quizzes created by lecturers for each database module.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
              }}
            >
              {normalizedQuizModules.length === 0 ? (
                <div className="text-slate-500">No quizzes available</div>
              ) : (
                normalizedQuizModules.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid #dbeafe",
                      background: "#f8fbff",
                      padding: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <h4 className="text-base font-bold leading-6 text-slate-900 sm:text-lg">
                        {item.moduleCode
                          ? `${item.moduleCode} - ${item.moduleName}`
                          : item.moduleName}
                      </h4>
                      <span
                        style={{
                          alignSelf: "flex-start",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          ...getDisplayedAssessmentStatusStyle(getDisplayedAssessmentStatus(item)),
                        }}
                      >
                        {getDisplayedAssessmentStatus(item)}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 6px", fontSize: 14, color: "#475569" }}>
                      Questions: {item.questionCount}
                    </p>
                    <p style={{ margin: "0 0 18px", fontSize: 14, color: "#475569" }}>
                      Score: {item.score}%
                    </p>

                    <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                      Attempts: {getAssessmentAttemptCount(item.id, "quiz")}/{MAX_QUIZ_ATTEMPTS}
                    </p>

                    <button
                      onClick={() => handleStartQuiz(item.id)}
                      disabled={getAssessmentAttemptCount(item.id, "quiz") >= MAX_QUIZ_ATTEMPTS && String(selectedQuizId) !== String(item.id)}
                      style={{
                        borderRadius: 14,
                        border: "none",
                        background:
                          getAssessmentAttemptCount(item.id, "quiz") >= MAX_QUIZ_ATTEMPTS &&
                          String(selectedQuizId) !== String(item.id)
                            ? "#cbd5e1"
                            : "#3b82f6",
                        color:
                          getAssessmentAttemptCount(item.id, "quiz") >= MAX_QUIZ_ATTEMPTS &&
                          String(selectedQuizId) !== String(item.id)
                            ? "#64748b"
                            : "#fff",
                        padding: "12px 18px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor:
                          getAssessmentAttemptCount(item.id, "quiz") >= MAX_QUIZ_ATTEMPTS &&
                          String(selectedQuizId) !== String(item.id)
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {String(selectedQuizId) === String(item.id)
                        ? "Close Quiz Paper"
                        : getAssessmentAttemptCount(item.id, "quiz") >= MAX_QUIZ_ATTEMPTS
                        ? "Locked after 5 attempts"
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
              <div
                style={{
                  marginTop: 24,
                  borderRadius: 24,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: 28,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <h4 className="text-xl font-extrabold text-slate-900">
                    {selectedQuiz.moduleCode
                      ? `${selectedQuiz.moduleCode} - ${selectedQuiz.moduleName}`
                      : selectedQuiz.moduleName}
                  </h4>
                  <span
                    style={{
                      borderRadius: 20,
                      background: "#fff7ed",
                      color: "#ea580c",
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {selectedQuiz.questionCount} Questions
                  </span>
                </div>

                <div
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "14px 16px",
                    flexWrap: "wrap",
                  }}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Timer starts when you open the quiz.
                  </p>
                  <span
                    style={{
                      borderRadius: 999,
                      padding: "6px 12px",
                      fontSize: 14,
                      fontWeight: 800,
                      background: quizTimeLeft <= 60 ? "#fee2e2" : "#fff7ed",
                      color: quizTimeLeft <= 60 ? "#dc2626" : "#ea580c",
                    }}
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
                  <div style={{ display: "grid", gap: 18, marginBottom: 28 }}>
                    {selectedQuiz.questions.map((question, index) => (
                      <div
                        key={`${selectedQuiz.id}-${question.id || index}`}
                        style={{
                          borderRadius: 18,
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          padding: 22,
                        }}
                      >
                        <p className="mb-5 text-sm font-semibold text-slate-900">
                          {index + 1}. {question.text}
                        </p>

                        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
                          {(Array.isArray(question.options) ? question.options : []).map(
                            (option, optionIndex) => {
                              const label = OPTION_LABELS[optionIndex] || "";
                              const isSelected = quizAttemptAnswers[index] === label;

                              return (
                                <label
                                  key={`${question.id || index}-${label}`}
                                  style={{
                                    borderRadius: 14,
                                    border: isSelected ? "1px solid #93c5fd" : "1px solid #dbe2ea",
                                    background: isSelected ? "#eff6ff" : "#ffffff",
                                    color: isSelected ? "#1d4ed8" : "#475569",
                                    padding: "14px 16px",
                                    fontSize: 14,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`quiz-${selectedQuiz.id}-question-${index}`}
                                    value={label}
                                    checked={isSelected}
                                    onChange={() => handleSelectAnswer(index, label)}
                                    className="accent-blue-600"
                                    style={{ marginTop: 3, flexShrink: 0 }}
                                  />
                                  <span style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                                    <span className="font-bold" style={{ minWidth: 20 }}>
                                      {label}.
                                    </span>
                                    <span>{option}</span>
                                  </span>
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
                  <div className="mt-8">
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
                  <div
                    style={{
                      marginTop: 8,
                      marginBottom: 28,
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    {quizValidationError ? (
                      <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {quizValidationError}
                      </p>
                    ) : null}

                    <button
                      onClick={handleSubmitQuiz}
                      style={{
                        borderRadius: 14,
                        border: "none",
                        background: "#f97316",
                        color: "#ffffff",
                        padding: "13px 22px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        minWidth: 132,
                      }}
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : null}

                {quizResult ? (
                  <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
                    <h5 className="text-lg font-extrabold text-emerald-800" style={{ margin: 0 }}>
                      {selectedQuiz.type === "selfcheck" ? "Self Check Result" : "Quiz Result"}
                    </h5>
                    {selectedQuiz.type === "selfcheck" ? (
                      <>
                        <div
                          style={{
                            marginTop: 20,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 14,
                              border: "1px solid #bbf7d0",
                              background: "rgba(255,255,255,0.72)",
                              padding: "14px 16px",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Score</p>
                            <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                              {quizResult.score100}/100
                            </p>
                          </div>
                          <div
                            style={{
                              borderRadius: 14,
                              border: "1px solid #bbf7d0",
                              background: "rgba(255,255,255,0.72)",
                              padding: "14px 16px",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Repeat</p>
                            <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                              {quizResult.attemptNumber}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: 20,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 14,
                              border: "1px solid #bbf7d0",
                              background: "rgba(255,255,255,0.72)",
                              padding: "14px 16px",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Outcomes Mastered</p>
                            <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                              {quizResult.checkedOutcomes} / {quizResult.totalOutcomes}
                            </p>
                          </div>
                          <div
                            style={{
                              borderRadius: 14,
                              border: "1px solid #bbf7d0",
                              background: "rgba(255,255,255,0.72)",
                              padding: "14px 16px",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Confidence Level</p>
                            <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                              {quizResult.confidenceLevel}/5
                            </p>
                          </div>
                        </div>
                        <div style={{ marginTop: 28 }}>
                          <h6 className="text-sm font-bold text-slate-900" style={{ margin: 0 }}>
                            Reflection
                          </h6>
                          <p className="mt-3 text-sm italic leading-6 text-emerald-700">
                            "{quizResult.reflection}"
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            marginTop: 20,
                            display: "grid",
                            gap: 22,
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                              gap: 16,
                              alignItems: "stretch",
                            }}
                          >
                            <div
                              style={{
                                borderRadius: 14,
                                border: "1px solid #a7f3d0",
                                background: "#ffffff",
                                padding: "16px 18px",
                                minHeight: 84,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Score</p>
                              <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                                {quizResult.score100}/100
                              </p>
                            </div>
                            <div
                              style={{
                                borderRadius: 14,
                                border: "1px solid #a7f3d0",
                                background: "#ffffff",
                                padding: "16px 18px",
                                minHeight: 84,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Repeat</p>
                              <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                                {quizResult.attemptNumber}
                              </p>
                            </div>
                            <div
                              style={{
                                borderRadius: 14,
                                border: "1px solid #a7f3d0",
                                background: "#ffffff",
                                padding: "16px 18px",
                                minHeight: 84,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: 12, color: "#047857", fontWeight: 700 }}>Correct</p>
                              <p style={{ margin: "6px 0 0", fontSize: 18, color: "#065f46", fontWeight: 800 }}>
                                {quizResult.correctCount} / {quizResult.totalQuestions}
                              </p>
                            </div>
                            <div
                              style={{
                                borderRadius: 14,
                                border: "1px solid #fecaca",
                                background: "#ffffff",
                                padding: "16px 18px",
                                minHeight: 84,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: 12, color: "#b91c1c", fontWeight: 700 }}>Wrong</p>
                              <p style={{ margin: "6px 0 0", fontSize: 18, color: "#991b1b", fontWeight: 800 }}>
                                {quizResult.wrongCount}
                              </p>
                            </div>
                          </div>

                          <div
                            style={{
                              borderRadius: 18,
                              border: "1px solid #bbf7d0",
                              background: "rgba(255,255,255,0.72)",
                              padding: "22px",
                            }}
                          >
                            <h6 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                              Wrong Answers Review
                            </h6>
                            {quizResult.wrongAnswers.length === 0 ? (
                              <p style={{ marginTop: 12, fontSize: 14, color: "#15803d", fontWeight: 600 }}>
                                No wrong answers. Great work!
                              </p>
                            ) : (
                              <div style={{ marginTop: 18, display: "grid", gap: 20 }}>
                                <div
                                  style={{
                                    display: "grid",
                                    gap: 16,
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    alignItems: "center",
                                    marginTop: 2,
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={wrongAnswerSearchQuery}
                                    onChange={(event) =>
                                      setWrongAnswerSearchQuery(event.target.value)
                                    }
                                    placeholder="Search wrong answers..."
                                    style={{
                                      width: "100%",
                                      borderRadius: 12,
                                      border: "1px solid #fdba74",
                                      background: "#ffffff",
                                      padding: "13px 15px",
                                      fontSize: 14,
                                      color: "#334155",
                                      outline: "none",
                                      minHeight: 48,
                                    }}
                                  />

                                  <button
                                    onClick={handleDownloadWrongAnswersPdf}
                                    style={{
                                      borderRadius: 12,
                                      border: "1px solid #fdba74",
                                      background: "#f97316",
                                      color: "#ffffff",
                                      padding: "13px 18px",
                                      fontSize: 14,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      minHeight: 48,
                                      width: "100%",
                                      justifySelf: "stretch",
                                    }}
                                  >
                                    Download Wrong Answers PDF
                                  </button>
                                </div>

                                {filteredWrongAnswers.length === 0 ? (
                                  <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                                    No wrong answers match your search.
                                  </p>
                                ) : (
                                  <div style={{ display: "grid", gap: 18 }}>
                                    {filteredWrongAnswers.map((item) => (
                                      <div
                                        key={`wrong-${item.questionNumber}`}
                                        style={{
                                          borderRadius: 14,
                                          border: "1px solid #fecaca",
                                          background: "#ffffff",
                                          padding: "18px 18px 20px",
                                        }}
                                      >
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                          {item.questionNumber}. {item.questionText}
                                        </p>
                                        <p style={{ margin: "12px 0 0", fontSize: 14, color: "#dc2626", lineHeight: 1.7 }}>
                                          Your answer: {item.selectedLabel || "Not selected"}
                                          {item.selectedText ? ` - ${item.selectedText}` : ""}
                                        </p>
                                        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#047857", lineHeight: 1.7 }}>
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
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {activeCategory === "selfcheck" && (
          <div
            style={{
              borderRadius: 24,
              border: "1px solid #f5d0fe",
              background: "#fff",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  background: "#f3e8ff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                }}
              >
                📚
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>Self Check</h3>
                <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
                  Access lecturer-created self-checks and repeat them anytime.
                </p>
              </div>
            </div>

            {normalizedSelfCheckModules.length === 0 ? (
              <div className="rounded-[24px] border border-purple-100 bg-purple-50/60 p-6 text-sm text-purple-700">
                No self-checks are available yet. Ask your lecturer to create one, or check back later.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 16,
                }}
              >
                {normalizedSelfCheckModules.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid #edd5ff",
                      background: "#fcfaff",
                      padding: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <h4 className="text-lg font-bold text-slate-900">
                        {item.moduleCode
                          ? `${item.moduleCode} - ${item.moduleName}`
                          : item.moduleName}
                      </h4>
                      <span
                        style={{
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          ...getDisplayedAssessmentStatusStyle(getDisplayedAssessmentStatus(item)),
                        }}
                      >
                        {getDisplayedAssessmentStatus(item)}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 18px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                      {item.type === "selfcheck"
                        ? `Self-assessment with ${item.learningOutcomes?.length || 0} learning outcomes.`
                        : `Repeatable self-check with ${item.questionCount} questions.`}
                    </p>

                    <button
                      onClick={() => handleStartQuiz(item.id)}
                      style={{
                        borderRadius: 14,
                        border: "none",
                        background: "#a855f7",
                        color: "#fff",
                        padding: "12px 18px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
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
              <div
                style={{
                  marginTop: 24,
                  borderRadius: 24,
                  border: "1px solid #e9d5ff",
                  background: "#ffffff",
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <h4 className="text-xl font-extrabold text-slate-900">
                    {selectedQuiz.moduleCode
                      ? `${selectedQuiz.moduleCode} - ${selectedQuiz.moduleName}`
                      : selectedQuiz.moduleName}
                  </h4>
                  <span
                    style={{
                      borderRadius: 20,
                      background: "#faf5ff",
                      color: "#9333ea",
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {selectedQuiz.learningOutcomes?.length || selectedQuiz.questionCount} Outcomes
                  </span>
                </div>

                <div style={{ display: "grid", gap: 18 }}>
                  <div
                    style={{
                      borderRadius: 18,
                      border: "1px solid #e9d5ff",
                      background: "#fcfaff",
                      padding: 18,
                    }}
                  >
                    <h4 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#7e22ce" }}>
                      Learning Outcomes Assessment
                    </h4>
                    <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7e22ce", lineHeight: 1.7 }}>
                      Check off the learning outcomes you feel confident about mastering.
                    </p>
                    <div style={{ display: "grid", gap: 10 }}>
                      {(selectedQuiz.learningOutcomes || []).map((outcome, index) => {
                        const outcomeId = outcome.id || index;
                        return (
                          <label
                            key={`outcome-${index}`}
                            htmlFor={`outcome-${outcomeId}`}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              borderRadius: 14,
                              border: "1px solid #e9d5ff",
                              background: "#ffffff",
                              padding: "12px 14px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              id={`outcome-${outcomeId}`}
                              checked={quizAttemptAnswers[index] || false}
                              onChange={(e) => {
                                handleSelectAnswer(index, e.target.checked);
                              }}
                              className="h-4 w-4 accent-purple-600 cursor-pointer"
                              style={{ marginTop: 3, flexShrink: 0 }}
                            />
                            <span
                              style={{
                                fontSize: 14,
                                color: "#475569",
                                lineHeight: 1.6,
                              }}
                            >
                              {outcome.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 18,
                      border: "1px solid #e9d5ff",
                      background: "#fcfaff",
                      padding: 18,
                    }}
                  >
                    <h4 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#7e22ce" }}>
                      Confidence Rating
                    </h4>
                    <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7e22ce", lineHeight: 1.7 }}>
                      How confident do you feel about this topic after the self-check?
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          value: "1",
                          label: "Very Low",
                          activeStyles: {
                            border: "1px solid #fca5a5",
                            background: "#fee2e2",
                            color: "#b91c1c",
                          },
                        },
                        {
                          value: "2",
                          label: "Low",
                          activeStyles: {
                            border: "1px solid #fdba74",
                            background: "#ffedd5",
                            color: "#c2410c",
                          },
                        },
                        {
                          value: "3",
                          label: "Medium",
                          activeStyles: {
                            border: "1px solid #fcd34d",
                            background: "#fef3c7",
                            color: "#b45309",
                          },
                        },
                        {
                          value: "4",
                          label: "High",
                          activeStyles: {
                            border: "1px solid #bef264",
                            background: "#ecfccb",
                            color: "#4d7c0f",
                          },
                        },
                        {
                          value: "5",
                          label: "Very High",
                          activeStyles: {
                            border: "1px solid #86efac",
                            background: "#dcfce7",
                            color: "#15803d",
                          },
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          style={{
                            borderRadius: 14,
                            border:
                              confidenceLevel === option.value
                                ? option.activeStyles.border
                                : "1px solid #e5e7eb",
                            background:
                              confidenceLevel === option.value
                                ? option.activeStyles.background
                                : "#ffffff",
                            color:
                              confidenceLevel === option.value
                                ? option.activeStyles.color
                                : "#475569",
                            padding: "12px 14px",
                            fontSize: 14,
                            fontWeight: 700,
                            textAlign: "center",
                            cursor: "pointer",
                          }}
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
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{option.value}/5</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 18,
                      border: "1px solid #e9d5ff",
                      background: "#fcfaff",
                      padding: 18,
                    }}
                  >
                    <h4 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#7e22ce" }}>
                      Reflection
                    </h4>
                    <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7e22ce", lineHeight: 1.7 }}>
                      Write a brief reflection on what you learned and areas for improvement.
                    </p>

                    <textarea
                      value={reflection || ""}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What did you learn? What concepts do you still need to work on?"
                      rows={4}
                      style={{
                        width: "100%",
                        borderRadius: 14,
                        border: "1px solid #d8b4fe",
                        background: "#ffffff",
                        padding: "14px 16px",
                        fontSize: 14,
                        outline: "none",
                        color: "#475569",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {quizValidationError ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                      {quizValidationError}
                    </p>
                  ) : null}

                  <button
                    onClick={handleSubmitQuiz}
                    style={{
                      borderRadius: 14,
                      border: "none",
                      background: "#a855f7",
                      color: "#ffffff",
                      padding: "12px 20px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Submit Self Check
                  </button>

                  {quizResult ? (
                    <div
                      style={{
                        marginTop: 20,
                        borderRadius: 18,
                        border: "1px solid #bbf7d0",
                        background: "#f0fdf4",
                        padding: 18,
                      }}
                    >
                      {selectedQuiz && selectedQuiz.type === "selfcheck" && quizResult ? (() => {
                        const recommendations = generateAIRecommendations(quizResult, selectedQuiz);
                        return recommendations.length > 0 ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                              <span className="ai-icon inline-block text-3xl">🤖</span>
                              <div>
                                <h5 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#14532d" }}>AI-Powered Improvement Suggestions</h5>
                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#15803d" }}>Personalized recommendations based on your performance</p>
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: 12 }}>
                              {recommendations.map((rec, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    borderRadius: 16,
                                    border:
                                      rec.priority === "high"
                                        ? "1px solid #fca5a5"
                                        : rec.priority === "medium"
                                        ? "1px solid #fcd34d"
                                        : "1px solid #93c5fd",
                                    background: "#ffffff",
                                    padding: 16,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                    <span style={{ fontSize: 24 }}>{rec.icon}</span>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{rec.title}</p>
                                      <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{rec.description}</p>
                                      <div
                                        style={{
                                          marginTop: 10,
                                          display: "inline-block",
                                          borderRadius: 999,
                                          padding: "4px 10px",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          background:
                                            rec.priority === "high"
                                              ? "#fee2e2"
                                              : rec.priority === "medium"
                                              ? "#fef3c7"
                                              : "#dbeafe",
                                          color:
                                            rec.priority === "high"
                                              ? "#b91c1c"
                                              : rec.priority === "medium"
                                              ? "#b45309"
                                              : "#1d4ed8",
                                        }}
                                      >
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
          <div className="progress-measure space-y-8">
            {/* Filter Section */}
            <div
              className="progress-measure-section"
              style={{
                borderRadius: 24,
                border: "1px solid #fed7aa",
                background: "#fffaf3",
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">🔍 Quiz Filter</h4>
                  <p className="text-sm text-slate-600">
                    Select a quiz to see repeat attempts, score changes, and improvement trends.
                  </p>
                </div>
                <select
                  value={selfCheckQuizFilter}
                  onChange={(event) => setSelfCheckQuizFilter(event.target.value)}
                  style={{
                    borderRadius: 14,
                    border: "1px solid #fdba74",
                    background: "#ffffff",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#334155",
                    outline: "none",
                  }}
                >
                  <option value="all">All Modules (Compare)</option>
                  {quizProgressOptions.map((option) => (
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
            <div className="progress-measure-metrics progress-measure-section grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="progress-measure-card" style={{ borderRadius: 20, border: "1px solid #e9d5ff", background: "#fcfaff", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Latest Mark</p>
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-3xl font-extrabold text-purple-600 mb-2">
                  {quizRepeatAnalytics.latestScore}%
                </h4>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${quizRepeatAnalytics.latestScore}%` }}></div>
                </div>
              </div>

              <div className="progress-measure-card" style={{ borderRadius: 20, border: "1px solid #bfdbfe", background: "#f8fbff", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Average Mark</p>
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-3xl font-extrabold text-blue-600 mb-2">
                  {quizRepeatAnalytics.averageScore}%
                </h4>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quizRepeatAnalytics.averageScore}%` }}></div>
                </div>
              </div>

              <div
                className="progress-measure-card"
                style={{
                  borderRadius: 20,
                  border: measureProgressDelta >= 0 ? "1px solid #86efac" : "1px solid #fca5a5",
                  background: measureProgressDelta >= 0 ? "#f0fdf4" : "#fef2f2",
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Progress</p>
                  <span className="text-2xl">{measureProgressDelta >= 0 ? '📈' : '📉'}</span>
                </div>
                <h4 className={`text-3xl font-extrabold mb-2 ${measureProgressDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {measureProgressDelta >= 0 ? "+" : ""}
                  {measureProgressDelta}%
                </h4>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.abs(measureProgressDelta), 100)}%`,
                      background: measureProgressDelta >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  ></div>
                </div>
              </div>

              <div className="progress-measure-card" style={{ borderRadius: 20, border: "1px solid #fde68a", background: "#fffbeb", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">Best Mark</p>
                  <span className="text-2xl">⭐</span>
                </div>
                <h4 className="text-3xl font-extrabold text-amber-600 mb-2">
                  {quizRepeatAnalytics.bestScore}%
                </h4>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${quizRepeatAnalytics.bestScore}%` }}></div>
                </div>
              </div>
            </div>

            {/* Quiz Repeat Analytics */}
            <div className="progress-measure-section progress-measure-analytics-shell" style={{ borderRadius: 24, border: "1px solid #bfdbfe", background: "#f8fbff", padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">📊 Quiz Repeat Analytics</h4>
              <p className="text-sm text-slate-600 mb-8">
                Analysis of repeat quiz attempts, improvement across repeats, and locked attempt counts.
              </p>

              <div className="progress-measure-analytics space-y-6">
                <div className="progress-measure-analytics-grid grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <style>{`
                    @keyframes countUp {
                      from { opacity: 0; transform: scale(0.5); }
                      to { opacity: 1; transform: scale(1); }
                    }
                    .metric-circle { animation: countUp 0.8s ease-out; }
                  `}</style>

                  <div className="progress-measure-card flex h-full flex-col rounded-[20px] border-2 border-blue-300 bg-white/80 p-6 backdrop-blur transition hover:shadow-lg">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-3xl font-bold text-white metric-circle shadow-lg">
                      {quizRepeatAnalytics.latestScore}%
                    </div>
                    <p className="text-center text-sm font-bold text-slate-900">Latest Score</p>
                    <p className="mt-2 text-center text-xs leading-5 text-slate-600">Most recent quiz result</p>
                  </div>

                  <div className="progress-measure-card flex h-full flex-col rounded-[20px] border-2 border-green-300 bg-white/80 p-6 backdrop-blur transition hover:shadow-lg">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-3xl font-bold text-white metric-circle shadow-lg">
                      {quizRepeatAnalytics.averageScore}%
                    </div>
                    <p className="text-center text-sm font-bold text-slate-900">Average Score</p>
                    <p className="mt-2 text-center text-xs leading-5 text-slate-600">Across quiz attempts</p>
                  </div>

                  <div className="progress-measure-card flex h-full flex-col rounded-[20px] border-2 border-yellow-300 bg-white/80 p-6 backdrop-blur transition hover:shadow-lg">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-3xl font-bold text-white metric-circle shadow-lg">
                      {quizRepeatAnalytics.averageRepeatGain >= 0 ? "+" : ""}{quizRepeatAnalytics.averageRepeatGain}%
                    </div>
                    <p className="text-center text-sm font-bold text-slate-900">Avg Repeat Gain</p>
                    <p className="mt-2 text-center text-xs leading-5 text-slate-600">Growth from first to latest attempt</p>
                  </div>

                  <div className="progress-measure-card flex h-full flex-col rounded-[20px] border-2 border-purple-300 bg-white/80 p-6 backdrop-blur transition hover:shadow-lg">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-600 text-3xl font-bold text-white metric-circle shadow-lg">
                      {quizRepeatAnalytics.improvingQuizzes}/{quizRepeatAnalytics.repeatQuizzes || quizRepeatAnalytics.totalAttempts}
                    </div>
                    <p className="text-center text-sm font-bold text-slate-900">Improving Quizzes</p>
                    <p className="mt-2 text-center text-xs leading-5 text-slate-600">Repeats showing upward progress</p>
                  </div>
                </div>

                <div className="progress-measure-area-grid grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="progress-measure-card progress-measure-repeat-card h-full rounded-[20px] border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50 p-6 transition hover:shadow-lg">
                    <h5 className="progress-measure-repeat-title text-sm font-bold text-red-800 mb-1">🔴 Slipping Repeats</h5>
                    <p className="progress-measure-repeat-subtitle text-xs text-red-600 mb-4 leading-5">Quizzes that are not improving across repeats</p>
                    {Array.from(quizAttemptsByAssessment.entries()).filter(([, attempts]) => attempts.length > 1 && (attempts[attempts.length - 1].score100 || 0) <= (attempts[0].score100 || 0)).length === 0 ? (
                      <p className="progress-measure-repeat-empty text-sm text-red-700 font-semibold">No slipping quizzes found.</p>
                    ) : (
                      <div className="progress-measure-repeat-list space-y-3">
                        {Array.from(quizAttemptsByAssessment.entries())
                          .filter(([, attempts]) => attempts.length > 1 && (attempts[attempts.length - 1].score100 || 0) <= (attempts[0].score100 || 0))
                          .map(([quizId, attempts]) => {
                            const latestAttempt = attempts[attempts.length - 1];
                            const firstAttempt = attempts[0];
                            const gain = Number(latestAttempt.score100 || 0) - Number(firstAttempt.score100 || 0);

                            return (
                              <div key={quizId} className="progress-measure-repeat-item">
                                <div className="progress-measure-repeat-row flex justify-between mb-2">
                                  <p className="progress-measure-repeat-module text-xs font-semibold text-red-800">
                                    {latestAttempt.moduleCode ? `${latestAttempt.moduleCode} - ${latestAttempt.moduleName}` : latestAttempt.moduleName}
                                  </p>
                                  <p className="progress-measure-repeat-delta text-xs font-bold text-red-600">{gain >= 0 ? "+" : ""}{gain}%</p>
                                </div>
                                <div className="progress-measure-repeat-bar h-2 bg-red-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500" style={{ width: `${Math.max(Math.min(Number(latestAttempt.score100 || 0), 100), 0)}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="progress-measure-card progress-measure-repeat-card h-full rounded-[20px] border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 transition hover:shadow-lg">
                    <h5 className="progress-measure-repeat-title text-sm font-bold text-green-800 mb-1">🟢 Improving Repeats</h5>
                    <p className="progress-measure-repeat-subtitle text-xs text-green-600 mb-4 leading-5">Quizzes where later attempts beat earlier ones</p>
                    {Array.from(quizAttemptsByAssessment.entries()).filter(([, attempts]) => attempts.length > 1 && (attempts[attempts.length - 1].score100 || 0) > (attempts[0].score100 || 0)).length === 0 ? (
                      <p className="progress-measure-repeat-empty text-sm text-green-700 font-semibold">Start repeating quizzes to identify improvement.</p>
                    ) : (
                      <div className="progress-measure-repeat-list space-y-3">
                        {Array.from(quizAttemptsByAssessment.entries())
                          .filter(([, attempts]) => attempts.length > 1 && (attempts[attempts.length - 1].score100 || 0) > (attempts[0].score100 || 0))
                          .map(([quizId, attempts]) => {
                            const latestAttempt = attempts[attempts.length - 1];
                            const firstAttempt = attempts[0];
                            const gain = Number(latestAttempt.score100 || 0) - Number(firstAttempt.score100 || 0);

                            return (
                              <div key={quizId} className="progress-measure-repeat-item">
                                <div className="progress-measure-repeat-row flex justify-between mb-2">
                                  <p className="progress-measure-repeat-module text-xs font-semibold text-green-800">
                                    {latestAttempt.moduleCode ? `${latestAttempt.moduleCode} - ${latestAttempt.moduleName}` : latestAttempt.moduleName}
                                  </p>
                                  <p className="progress-measure-repeat-delta text-xs font-bold text-green-600">+{gain}%</p>
                                </div>
                                <div className="progress-measure-repeat-bar h-2 bg-green-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${Math.max(Math.min(Number(latestAttempt.score100 || 0), 100), 0)}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="progress-measure-card progress-measure-recommendation rounded-[20px] border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 p-6">
                  <h5 className="text-sm font-bold text-cyan-800 mb-2">💡 Repeat Analysis</h5>
                  <p className="mt-1 text-sm leading-relaxed text-cyan-700">{quizRepeatAnalytics.recommendation}</p>
                </div>

                <div className="progress-measure-card progress-measure-module-summary rounded-[20px] border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6">
                  <h5 className="progress-measure-module-summary-title text-sm font-bold text-indigo-800 mb-2">📘 Module-by-Module Summary</h5>
                  <p className="progress-measure-module-summary-subtitle text-xs text-indigo-600 mb-4 leading-5">
                    Each module is tracked separately so you can compare repeat performance module to module.
                  </p>
                  {quizModuleSummaries.length === 0 ? (
                    <p className="text-sm font-semibold text-indigo-700">No module summaries available yet.</p>
                  ) : (
                    <div className="progress-measure-module-summary-grid grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {quizModuleSummaries.map((summary) => (
                        <div
                          key={summary.quizId}
                          className="progress-measure-module-summary-card rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm"
                        >
                          <div className="progress-measure-module-summary-head flex items-start justify-between gap-3">
                            <div className="progress-measure-module-summary-copy">
                              <p className="progress-measure-module-summary-name text-sm font-bold text-slate-900">{summary.moduleName}</p>
                              <p className="progress-measure-module-summary-attempts mt-1 text-xs text-slate-500">{summary.attemptsCount} attempt{summary.attemptsCount === 1 ? "" : "s"}</p>
                            </div>
                            <span
                              className="progress-measure-module-summary-badge rounded-full px-2.5 py-1 text-[11px] font-bold"
                              style={{
                                background: summary.isImproving ? "#dcfce7" : "#fee2e2",
                                color: summary.isImproving ? "#166534" : "#b91c1c",
                              }}
                            >
                              {summary.gain >= 0 ? "+" : ""}{summary.gain}%
                            </span>
                          </div>
                          <div className="progress-measure-module-summary-stats mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                            <div className="progress-measure-module-summary-stat">
                              <p className="font-semibold text-slate-500">First</p>
                              <p className="mt-1 font-bold text-slate-900">{summary.firstScore}%</p>
                            </div>
                            <div className="progress-measure-module-summary-stat">
                              <p className="font-semibold text-slate-500">Latest</p>
                              <p className="mt-1 font-bold text-slate-900">{summary.latestScore}%</p>
                            </div>
                            <div className="progress-measure-module-summary-stat">
                              <p className="font-semibold text-slate-500">Gain</p>
                              <p className="mt-1 font-bold text-slate-900">{summary.gain >= 0 ? "+" : ""}{summary.gain}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment History */}
            <div className="progress-measure-section progress-measure-history rounded-[24px] border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-7 shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-2">📋 Quiz Repeat History</h4>
              <p className="progress-measure-history-subtitle text-sm text-slate-600 mb-6">
                Quiz repeats are stored with marks and timestamps.
              </p>

              {quizAttemptsOnly.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-6 text-center">
                  <p className="text-sm text-orange-700 font-semibold">No quiz attempts recorded yet. Start with a quiz!</p>
                </div>
              ) : (
                <div className="progress-measure-history-list grid gap-4">
                  {[...quizAttemptsOnly].reverse().map((attempt, idx) => (
                    <div
                      key={attempt.id || `${attempt.quizId}-${attempt.attemptNumber}-${idx}`}
                      className="progress-measure-history-item rounded-[18px] border-2 border-orange-200 bg-white p-5 hover:shadow-md transition hover:border-orange-300"
                      style={{ animation: `slideInUp 0.3s ease-out ${idx * 0.05}s backwards` }}
                    >
                      <style>{`
                        @keyframes slideInUp {
                          from { opacity: 0; transform: translateY(10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}</style>
                      <div className="progress-measure-history-row flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="progress-measure-history-copy">
                          <p className="progress-measure-history-module text-sm font-bold text-slate-900">
                            {attempt.moduleCode
                              ? `${attempt.moduleCode} - ${attempt.moduleName}`
                              : attempt.moduleName}
                          </p>
                          <p className="progress-measure-history-meta text-xs text-slate-500 mt-2">
                            Attempt {attempt.attemptNumber} • {new Date(attempt.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="progress-measure-history-stats flex items-center gap-4">
                          <div className="text-right">
                            <div className="progress-measure-history-score inline-block rounded-lg bg-orange-100 px-3 py-2">
                              <p className="text-sm font-extrabold text-orange-600">{attempt.score100}%</p>
                            </div>
                          </div>
                          <div className="progress-measure-history-correct text-right text-xs">
                            <p className="font-semibold text-slate-700">
                              {Number.isFinite(attempt.correctCount) && Number.isFinite(attempt.totalQuestions)
                                ? `${attempt.correctCount}/${attempt.totalQuestions}`
                                : "Progress"}
                            </p>
                            <p className="text-slate-500">
                              {Number.isFinite(attempt.correctCount) && Number.isFinite(attempt.totalQuestions)
                                ? "correct"
                                : "tracked"}
                            </p>
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
          <div className="progress-streak space-y-8">
            {/* Analytics Cards */}
            <div className="progress-streak-grid grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="progress-streak-card rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Current Streak</p>
                <h3 className="mt-2 text-5xl font-extrabold text-emerald-600">
                  {streakData.currentStreak}
                </h3>
                <p className="mt-2 text-sm text-slate-600">days in a row</p>
                <div className="mt-3 h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="progress-streak-card rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Best Streak</p>
                <h3 className="mt-2 text-5xl font-extrabold text-amber-600">
                  {streakData.bestStreak}
                </h3>
                <p className="mt-2 text-sm text-slate-600">best record</p>
              </div>

              <div className="progress-streak-card rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Study Days</p>
                <h3 className="mt-2 text-5xl font-extrabold text-blue-600">
                  {streakData.studyDays}
                </h3>
                <p className="mt-2 text-sm text-slate-600">completed days</p>
              </div>

              <div className="progress-streak-card rounded-[28px] border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-500">Badge Level</p>
                <h3 className="mt-2 text-3xl font-extrabold text-purple-600">
                  {streakData.level}
                </h3>
                <p className="mt-2 text-sm text-slate-600">keep going strong</p>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="progress-streak-panel rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Weekly Activity</h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyActivity.map((day) => {
                  const colors = ["bg-slate-100", "bg-green-200", "bg-green-400", "bg-green-500", "bg-green-600"];
                  return (
                    <div key={day.label} className="text-center">
                      <div className={`rounded-lg h-12 w-full mb-2 ${colors[day.intensity]} hover:scale-110 transition`}></div>
                      <p className="text-xs font-semibold text-slate-600">{day.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{day.attempts}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-500">Darker shade = more study activity</p>
            </div>

            {/* Time Spent & Subjects */}
            <div className="progress-streak-split grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="progress-streak-panel rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">⏱️ Time This Week</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">Self Checks</p>
                      <p className="text-sm font-bold text-blue-600">{formatMinutes(weeklyTimeStats.selfCheckMinutes)}</p>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${weeklyTimeStats.selfCheckPct}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">Quizzes</p>
                      <p className="text-sm font-bold text-purple-600">{formatMinutes(weeklyTimeStats.quizMinutes)}</p>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${weeklyTimeStats.quizPct}%` }}></div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-amber-600">Total: {formatMinutes(weeklyTimeStats.totalMinutes)}</p>
              </div>

              <div className="progress-streak-panel rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Top Subjects</h3>
                <div className="space-y-3">
                  {topSubjects.length === 0 ? (
                    <p className="text-sm text-slate-600">No module activity yet.</p>
                  ) : topSubjects.map((subject, idx) => (
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
            <div className="progress-streak-hero md:col-span-2 xl:col-span-4 rounded-[28px] border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-8 shadow-lg">
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
            <div className="progress-streak-panel rounded-[28px] border border-purple-100 bg-white p-6 shadow-sm">
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
            <div className="progress-streak-panel rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🔮 AI Performance Insights</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">📈 Streak Prediction</p>
                  <p className="text-xs text-slate-600">Based on current patterns, you're <span className="font-bold text-green-600">{aiInsights.streakLikelihood}% likely</span> to maintain your streak this week.</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">⏰ Best Study Time</p>
                  <p className="text-xs text-slate-600">You're most productive between <span className="font-bold">{aiInsights.bestStudyTime}</span>. Peak focus from your attempt history.</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">📚 Recommended Module</p>
                  <p className="text-xs text-slate-600">Focus on <span className="font-bold">{aiInsights.weakestModule ? aiInsights.weakestModule.name : "your next active module"}</span> next. This is currently your lowest-scoring module.</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">🚀 Growth Rate</p>
                  <p className="text-xs text-slate-600">You're improving at <span className="font-bold">{aiInsights.growthRate >= 0 ? "+" : ""}{aiInsights.growthRate}% per week</span> based on this week's vs last week's attempts.</p>
                </div>
              </div>
            </div>

            {/* Recovery Guide */}
            <div className="progress-streak-panel rounded-[28px] border border-red-100 bg-red-50/50 p-6 shadow-sm">
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
  );
}

export default ProgressTracker;
