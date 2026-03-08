import React from "react";

function ProgressTracker() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* GPA Calculator */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">🎓 GPA Calculator</h2>
          <p className="text-gray-600">Calculate GPA based on grades and credits.</p>
        </div>

        {/* Module Quiz */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">📝 Module Quiz</h2>
          <p className="text-gray-600">Test your understanding with module quizzes.</p>
        </div>

        {/* Learning Streak */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">🔥 Learning Streak</h2>
          <p className="text-gray-600">Track how consistently you are learning.</p>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">📈 Performance Trend</h2>
          <p className="text-gray-600">See how your performance changes over time.</p>
        </div>

      </div>

    </div>
  );
}

export default ProgressTracker;