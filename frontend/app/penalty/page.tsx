"use client";
import { useState } from "react";
import Link from "next/link";

type Direction = "left" | "center" | "right";

export default function PenaltyKick() {
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [kickDir, setKickDir] = useState<Direction | null>(null);
  const [msg, setMsg] = useState("");

  const kick = async (dir: Direction) => {
    if (active || attempts >= 3) return;
    
    setActive(true);
    setKickDir(dir);
    setResult(null);
    setMsg("");

    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/penalty-kick/?choice=${dir}`);
        const data = await res.json();
        
        setResult(data.goal ? "goal" : "save");
        setMsg(data.message);
        
        if (data.goal) {
          setScore(score + 1);
        }
        
        setAttempts(attempts + 1);
        
        setTimeout(() => {
          setActive(false);
          setKickDir(null);
          setResult(null);
        }, 2000);
      } catch {
        setActive(false);
        setKickDir(null);
      }
    }, 600);
  };

  const reset = () => {
    setScore(0);
    setAttempts(0);
    setActive(false);
    setResult(null);
    setKickDir(null);
    setMsg("");
  };

  const done = attempts >= 3;
  const remaining = 3 - attempts;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="px-6 py-10 w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-300 transition">
            ← Back
          </Link>
          <div className="text-xl font-medium text-neutral-400">페널티킥 게임</div>
        </div>

        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500 mb-1">골 득점</div>
                <div className="text-5xl font-bold tabular-nums">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-neutral-500 mb-1">남은 기회</div>
                <div className="text-5xl font-bold tabular-nums">{remaining}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-500 mb-1">시도</div>
                <div className="text-5xl font-bold tabular-nums">{attempts}/3</div>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] bg-gradient-to-b from-green-900 to-green-800 overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px)`,
              backgroundSize: '50px 50px'
            }}></div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-40 border-4 border-white rounded-b-full">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-40 h-20 border-4 border-t-0 border-white rounded-b-full"></div>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-32 flex items-start justify-between px-4">
              <div className="w-3 h-full bg-white rounded-full"></div>
              <div className="w-3 h-full bg-white rounded-full"></div>
            </div>

            <div 
              className={`absolute transition-all duration-500 ${
                active && kickDir === "center" 
                  ? "top-24 left-1/2 -translate-x-1/2" 
                  : "top-32 left-1/2 -translate-x-1/2"
              }`}
            >
              <div className={`text-8xl transition-transform duration-500 ${
                active ? "scale-75" : "scale-100"
              }`}>
                🧤
              </div>
            </div>

            {active && (
              <div 
                className={`absolute transition-all duration-500 ease-out ${
                  kickDir === "left" 
                    ? "top-24 left-20" 
                    : kickDir === "right" 
                    ? "top-24 right-20" 
                    : "top-24 left-1/2 -translate-x-1/2"
                }`}
              >
                <div className="text-6xl animate-bounce">⚽</div>
              </div>
            )}

            {!active && (
              <div className="absolute bottom-40 left-1/2 -translate-x-1/2">
                <div className="text-7xl">⚽</div>
              </div>
            )}

            {result && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-8 py-4 rounded-2xl ${
                result === "goal" 
                  ? "bg-green-500/90" 
                  : "bg-red-500/90"
              } animate-pulse`}>
                <div className="text-6xl mb-2">{result === "goal" ? "🎉" : "❌"}</div>
                <div className="text-2xl font-bold">{msg}</div>
              </div>
            )}
          </div>

          <div className="p-8">
            {!done ? (
              <>
                <div className="text-center mb-6 text-neutral-400">
                  골키퍼는 항상 중앙으로 몸을 날립니다!
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => kick("left")}
                    disabled={active}
                    className="px-8 py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                  >
                    ← 왼쪽
                  </button>
                  <button
                    onClick={() => kick("center")}
                    disabled={active}
                    className="px-8 py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                  >
                    ↑ 중앙
                  </button>
                  <button
                    onClick={() => kick("right")}
                    disabled={active}
                    className="px-8 py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                  >
                    오른쪽 →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">게임 종료!</div>
                <div className="text-2xl text-neutral-400 mb-6">
                  총 {score}골을 넣었습니다!
                </div>
                <button
                  onClick={reset}
                  className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                >
                  다시 하기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-neutral-500">
          🥅 페널티킥 게임 시작! 기회는 총 3번! 🥅
        </div>
      </div>
    </div>
  );
}

