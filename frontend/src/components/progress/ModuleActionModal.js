import React from "react";
import { useNavigate } from "react-router-dom";

function ModuleActionModal({ module, onClose }) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-400 hover:text-white"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-2">{module.name}</h2>
        <p className="text-gray-400 mb-6">Choose an activity for this module.</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/progress-tracker/quiz/${module.id}`)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium"
          >
            Start Quiz
          </button>

          <button
            onClick={() => navigate(`/progress-tracker/self-check/${module.id}`)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium border border-gray-700"
          >
            Start Self Check
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleActionModal;