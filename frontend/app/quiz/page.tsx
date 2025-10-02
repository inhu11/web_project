"use client";
import { useState } from "react";
import Link from "next/link";

export default function Quiz() {
  const [problem, setProblem] = useState<string>("");
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);
  const [op, setOp] = useState<string>("+");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const getNewProblem = () => {
    fetch("http://127.0.0.1:8000/api/math-quiz/")
      .then((r) => r.json())
      .then((d) => {
        setProblem(d.problem);
        setA(d.numbers[0]);
        setB(d.numbers[1]);
        setOp(d.operation);
        setUserAnswer("");
        setResult("");
      });
  };

  const checkAnswer = () => {
    if (!userAnswer) return;
    
    fetch(`http://127.0.0.1:8000/api/check-answer/?a=${a}&b=${b}&op=${op}&answer=${userAnswer}`)
      .then((r) => r.json())
      .then((d) => {
        setResult(d.message);
        setTotal(total + 1);
        if (d.correct) {
          setScore(score + 1);
        }
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!result) {
        checkAnswer();
      } else {
        getNewProblem();
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-neutral-400 hover:text-neutral-100 transition">
            ← Back to Clock
          </Link>
          <div className="text-sm text-neutral-500">
            Score: {score}/{total}
          </div>
        </div>

        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-10">
          <h1 className="text-3xl font-semibold mb-8 text-center">Math Quiz</h1>
          
          {!problem ? (
            <div className="text-center">
              <p className="text-neutral-400 mb-6">Practice your math skills!</p>
              <button
                onClick={getNewProblem}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition"
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-8">{problem}</div>
                
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Your answer"
                  className="w-full max-w-xs px-6 py-4 text-2xl text-center bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-600 transition"
                  disabled={!!result}
                  autoFocus
                />
              </div>

              {result && (
                <div className={`text-center text-xl font-medium p-4 rounded-xl ${
                  result.includes("Great") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                }`}>
                  {result}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {!result ? (
                  <button
                    onClick={checkAnswer}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={getNewProblem}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition"
                  >
                    Next Problem
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400">
          <h3 className="font-semibold mb-2 text-neutral-300">How it works:</h3>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Backend (Django) creates random math problems</li>
            <li>Frontend (Next.js) shows the problem to you</li>
            <li>You type your answer</li>
            <li>Backend checks if your answer is correct</li>
            <li>Frontend shows you the result!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

