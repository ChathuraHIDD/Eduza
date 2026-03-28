import React, { useMemo, useState } from "react";

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

  const gradingScale = [
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

  const [activeCategory, setActiveCategory] = useState("gpa");
  const [modules, setModules] = useState([
    { id: 1, moduleName: "", credits: 3, grade: "A" },
  ]);

  const [quizModules] = useState([
    { name: "Mathematics for Computing", questions: 15, score: 78, status: "Completed" },
    { name: "Database Systems", questions: 12, score: 85, status: "Completed" },
    { name: "Software Engineering", questions: 20, score: 0, status: "Not Started" },
    { name: "DSA", questions: 18, score: 64, status: "In Progress" },
  ]);

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

  const getGradePoint = (grade) => {
    const found = gradingScale.find((item) => item.grade === grade);
    return found ? found.gpa : 0;
  };

  const handleModuleChange = (id, field, value) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, [field]: value } : module
      )
    );
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
  };

  const removeModule = (id) => {
    if (modules.length === 1) return;
    setModules((prev) => prev.filter((module) => module.id !== id));
  };

  const summary = useMemo(() => {
    const validModules = modules.filter(
      (m) => m.moduleName.trim() !== "" && Number(m.credits) > 0
    );

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
  }, [modules]);

  const getGpaLabel = (gpa) => {
    const value = Number(gpa);
    if (value >= 3.7) return "Excellent";
    if (value >= 3.3) return "Very Good";
    if (value >= 3.0) return "Good";
    if (value >= 2.0) return "Average";
    if (value > 0) return "Needs Improvement";
    return "No Data";
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
                  <text
                    x={10}
                    y={y + 4}
                    fontSize="12"
                    fill="#64748b"
                  >
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
        {/* Header */}
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

        {/* Category Cards */}
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

        {/* Dynamic Content */}
        {activeCategory === "gpa" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* GPA Calculator */}
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

                <div className="mt-5">
                  <button
                    onClick={addModule}
                    className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
                  >
                    <span className="text-lg">⊕</span>
                    Add Module
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
              </div>
            </div>

            {/* Grading Scale */}
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
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Module Quiz
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick module quizzes to test your understanding.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {quizModules.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-blue-100 bg-blue-50/40 p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600 shadow-sm">
                      {item.status}
                    </span>
                  </div>

                  <p className="mb-2 text-sm text-slate-600">
                    Questions: {item.questions}
                  </p>
                  <p className="mb-5 text-sm text-slate-600">
                    Score: {item.score}%
                  </p>

                  <button className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600">
                    Open Quiz
                  </button>
                </div>
              ))}
            </div>
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