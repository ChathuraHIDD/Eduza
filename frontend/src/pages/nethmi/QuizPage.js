import React from "react";
import { useParams } from "react-router-dom";

function QuizPage() {
  const { moduleId } = useParams();

  const alreadyAttempted = false;

  if (alreadyAttempted) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Quiz</h1>
        <p>You have already attempted this quiz for {moduleId}.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quiz - {moduleId}</h1>
      <p>This is the quiz page. Only one attempt is allowed.</p>
    </div>
  );
}

export default QuizPage;