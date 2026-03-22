import { useMemo, useState } from "react";

const GRADE_POINTS = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0,
};

const freshSubject = (id) => ({ id, name: "", grade: "A", credits: 0 });

const GPACalculator = () => {
  const [subjects, setSubjects] = useState([freshSubject(1)]);

  const addSubject = () => {
    setSubjects((prev) => [...prev, freshSubject(prev.length + 1)]);
  };

  const updateSubject = (id, key, value) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === id
          ? { ...subject, [key]: key === "credits" ? Number(value) : value }
          : subject
      )
    );
  };

  const removeSubject = (id) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  const { gpa, totalCredits, totalPoints } = useMemo(() => {
    const totals = subjects.reduce(
      (acc, { grade, credits }) => {
        const gp = GRADE_POINTS[grade] ?? 0;
        const credit = Number(credits) || 0;
        acc.totalPoints += gp * credit;
        acc.totalCredits += credit;
        return acc;
      },
      { totalPoints: 0, totalCredits: 0 }
    );

    return {
      totalPoints: totals.totalPoints,
      totalCredits: totals.totalCredits,
      gpa: totals.totalCredits > 0 ? totals.totalPoints / totals.totalCredits : 0,
    };
  }, [subjects]);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="grid grid-cols-12 gap-3 items-end p-4 border border-gray-700 rounded-xl bg-gray-800/80"
          >
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={`Subject ${index + 1}`}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Grade
              </label>
              <select
                value={subject.grade}
                onChange={(e) => updateSubject(subject.id, "grade", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {Object.keys(GRADE_POINTS).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={subject.credits}
                onChange={(e) => updateSubject(subject.id, "credits", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="col-span-12 sm:col-span-1 flex justify-end">
              <button
                onClick={() => removeSubject(subject.id)}
                className="px-3 py-2.5 text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={subjects.length === 1}
                title="Remove subject"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={addSubject}
          className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow"
        >
          + Add Subject
        </button>
      </div>

      <div className="p-5 bg-gray-800 border border-gray-700 rounded-xl">
        <div className="space-y-1 text-gray-300 text-sm mb-4">
          <p>
            <span className="font-medium text-white">Total Credits:</span> {totalCredits}
          </p>
          <p>
            <span className="font-medium text-white">Grade Points:</span>{" "}
            {totalPoints.toFixed(2)}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-3xl font-bold text-orange-400">
            {totalCredits > 0 ? gpa.toFixed(2) : "N/A"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Current GPA</p>
        </div>
      </div>
    </div>
  );
};

export default GPACalculator;