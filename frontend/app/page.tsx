"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
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
          <div className="text-xl font-semibold text-neutral-100">수학 퀴즈</div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-500">
              점수: {score}/{total}
            </div>
            <Link 
              href="/penalty" 
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
            >
              ⚽ 페널티킥
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-10">
          <h1 className="text-3xl font-semibold mb-8 text-center">수학 실력을 연습하세요</h1>
          
          {!problem ? (
            <div className="text-center">
              <p className="text-neutral-400 mb-6">수학 능력을 테스트할 준비가 되셨나요?</p>
              <button
                onClick={getNewProblem}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition"
              >
                퀴즈 시작
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
                  placeholder="답을 입력하세요"
                  className="w-full max-w-xs px-6 py-4 text-2xl text-center bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-blue-600 transition"
                  disabled={!!result}
                  autoFocus
                />
              </div>

              {result && (
                <div className={`text-center text-xl font-medium p-4 rounded-xl ${
                  result.includes("정답") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                }`}>
                  {result}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {!result ? (
                  <button
                    onClick={checkAnswer}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition"
                  >
                    답안 확인
                  </button>
                ) : (
                  <button
                    onClick={getNewProblem}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition"
                  >
                    다음 문제
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400">
          <h3 className="font-semibold mb-2 text-neutral-300">작동 방식:</h3>
          <ol className="space-y-1 list-decimal list-inside">
            <li>백엔드(Django)가 랜덤 수학 문제를 생성합니다</li>
            <li>프론트엔드(Next.js)가 문제를 보여줍니다</li>
            <li>답을 입력합니다</li>
            <li>백엔드가 답이 맞는지 확인합니다</li>
            <li>프론트엔드가 결과를 보여줍니다!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
