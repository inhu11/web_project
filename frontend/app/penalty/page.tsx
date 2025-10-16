"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Direction = "left" | "center" | "right";

// Constants for better readability
const GAME_CONFIG = {
  maxAttempts: 5,
  kickDelay: 600,
  resultDisplayTime: 2500,
  animationSpeed: 20,
  animationStep: 0.05,
};

const BALL_CONFIG = {
  startY: 88,
  startX: 50,
  startSize: 64,
  endSize: 32,
  targetY: 60,
};

const POSITION_CONFIG = {
  left: { x: 15, keeperX: "left-[5%]" },
  center: { x: 50, keeperX: "left-1/2 -translate-x-1/2" },
  right: { x: 85, keeperX: "right-[5%]" },
};

export default function PenaltyKick() {
  // State management
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [kickDir, setKickDir] = useState<Direction | null>(null);
  const [keeperDir, setKeeperDir] = useState<Direction>("center");
  const [msg, setMsg] = useState("");
  const [ballPos, setBallPos] = useState({ x: BALL_CONFIG.startX, y: BALL_CONFIG.startY });
  const [ballSize, setBallSize] = useState(BALL_CONFIG.startSize);
  
  // Audio refs
  const kickSound = useRef<HTMLAudioElement | null>(null);
  const goalSound = useRef<HTMLAudioElement | null>(null);
  const missSound = useRef<HTMLAudioElement | null>(null);
  const chantSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    kickSound.current = new Audio('/audios/soccer/ball_kick.mp3');
    goalSound.current = new Audio('/audios/soccer/goal_reaction.mp3');
    missSound.current = new Audio('/audios/soccer/miss_reaction.mp3');
    chantSound.current = new Audio('/audios/soccer/chant.mp3');
    
    if (chantSound.current) {
      chantSound.current.loop = true;
      chantSound.current.volume = 0.3;
      chantSound.current.play().catch(() => {});
    }
    
    return () => {
      if (chantSound.current) {
        chantSound.current.pause();
      }
    };
  }, []);

  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  const animateBall = (targetX: number) => {
    let progress = 0;
    
    const animateInterval = setInterval(() => {
      progress += GAME_CONFIG.animationStep;
      
      if (progress >= 1) {
        clearInterval(animateInterval);
        setBallPos({ x: targetX, y: BALL_CONFIG.targetY });
        setBallSize(BALL_CONFIG.endSize);
      } else {
        const currentX = BALL_CONFIG.startX + (targetX - BALL_CONFIG.startX) * progress;
        const currentY = BALL_CONFIG.startY - (BALL_CONFIG.startY - BALL_CONFIG.targetY) * progress;
        const currentSize = BALL_CONFIG.startSize - (BALL_CONFIG.startSize - BALL_CONFIG.endSize) * progress;
        
        setBallPos({ x: currentX, y: currentY });
        setBallSize(currentSize);
      }
    }, GAME_CONFIG.animationSpeed);
  };

  const resetBall = () => {
    setBallPos({ x: BALL_CONFIG.startX, y: BALL_CONFIG.startY });
    setBallSize(BALL_CONFIG.startSize);
  };

  const kick = async (dir: Direction) => {
    if (active || attempts >= GAME_CONFIG.maxAttempts) return;
    
    setActive(true);
    setKickDir(dir);
    setResult(null);
    setMsg("");
    setKeeperDir("center");

    playSound(kickSound.current);
    animateBall(POSITION_CONFIG[dir].x);

    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/penalty-kick/?choice=${dir}`);
        const data = await res.json();
        
        setKeeperDir(data.keeper_choice);
        setResult(data.goal ? "goal" : "save");
        setMsg(data.message);
        
        playSound(data.goal ? goalSound.current : missSound.current);
        
        if (data.goal) {
          setScore(score + 1);
        }
        
        setAttempts(attempts + 1);
        
        setTimeout(() => {
          setActive(false);
          setKickDir(null);
          setResult(null);
          setKeeperDir("center");
          resetBall();
        }, GAME_CONFIG.resultDisplayTime);
      } catch {
        setActive(false);
        setKickDir(null);
        resetBall();
      }
    }, GAME_CONFIG.kickDelay);
  };

  const reset = () => {
    setScore(0);
    setAttempts(0);
    setActive(false);
    setResult(null);
    setKickDir(null);
    setKeeperDir("center");
    setMsg("");
    resetBall();
  };

  const done = attempts >= GAME_CONFIG.maxAttempts;
  const remaining = GAME_CONFIG.maxAttempts - attempts;

  const getKeeperImage = () => {
    const images = {
      left: "/images/soccer/goalkeeper_dive_left.png",
      right: "/images/soccer/goalkeeper_dive_right.png",
      center: "/images/soccer/goalkeeper_center.png",
    };
    return images[keeperDir];
  };

  const getEndGameMessage = () => {
    if (score >= 4) return { emoji: "🏆", text: "완벽해요! 프로 선수시네요! 🌟" };
    if (score >= 3) return { emoji: "⭐", text: "훌륭해요! 멋진 실력입니다! 👏" };
    if (score >= 2) return { emoji: "👍", text: "좋아요! 더 연습해봐요! 💪" };
    return { emoji: "💪", text: "아쉬워요! 다시 도전해보세요! 🔥" };
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="px-6 py-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <Header />

        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Score Board */}
          <ScoreBoard score={score} remaining={remaining} attempts={attempts} maxAttempts={GAME_CONFIG.maxAttempts} />

          {/* Game Field */}
          <GameField
            ballPos={ballPos}
            ballSize={ballSize}
            keeperDir={keeperDir}
            keeperImage={getKeeperImage()}
            active={active}
            result={result}
            message={msg}
          />

          {/* Controls */}
          <Controls
            done={done}
            active={active}
            score={score}
            onKick={kick}
            onReset={reset}
            endGameMessage={getEndGameMessage()}
          />
        </div>

        {/* Instructions */}
        <Instructions />
      </div>
    </div>
  );
}

// Sub-components for better organization

function Header() {
  return (
    <div className="flex items-center justify-between mb-8">
      <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-300 transition">
        ← 돌아가기
      </Link>
      <div className="text-xl font-semibold text-neutral-100">
        ⚽ 페널티킥 게임
      </div>
    </div>
  );
}

function ScoreBoard({ score, remaining, attempts, maxAttempts }: {
  score: number;
  remaining: number;
  attempts: number;
  maxAttempts: number;
}) {
  return (
    <div className="p-8 border-b border-neutral-800">
      <div className="flex items-center justify-between">
        <StatDisplay label="골 득점" value={score} color="text-green-400" />
        <StatDisplay label="남은 기회" value={remaining} />
        <StatDisplay label="시도" value={`${attempts}/${maxAttempts}`} />
      </div>
    </div>
  );
}

function StatDisplay({ label, value, color = "text-white" }: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div>
      <div className="text-sm text-neutral-500 mb-1">{label}</div>
      <div className={`text-5xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function GameField({
  ballPos,
  ballSize,
  keeperDir,
  keeperImage,
  active,
  result,
  message,
}: {
  ballPos: { x: number; y: number };
  ballSize: number;
  keeperDir: Direction;
  keeperImage: string;
  active: boolean;
  result: "goal" | "save" | null;
  message: string;
}) {
  const keeperPosition = POSITION_CONFIG[keeperDir].keeperX;

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Stadium Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/soccer/penalty_pov.jpg"
          alt="Penalty view"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Goalkeeper */}
      <div className={`absolute transition-all duration-500 ease-out bottom-25 ${keeperPosition}`}>
        <div className="relative w-60 h-60">
          <Image
            src={keeperImage}
            alt="Goalkeeper"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Soccer Ball */}
      <SoccerBall ballPos={ballPos} ballSize={ballSize} active={active} />

      {/* Result Message */}
      {result && <ResultMessage result={result} message={message} />}
    </div>
  );
}

function SoccerBall({ ballPos, ballSize, active }: {
  ballPos: { x: number; y: number };
  ballSize: number;
  active: boolean;
}) {
  return (
    <div
      className="absolute transition-all duration-500 ease-out"
      style={{
        left: `${ballPos.x}%`,
        top: `${ballPos.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="relative transition-all duration-300"
        style={{ width: `${ballSize}px`, height: `${ballSize}px` }}
      >
        <Image
          src="/images/soccer/soccer_ball.png"
          alt="Soccer ball"
          fill
          className={`object-contain drop-shadow-2xl ${active ? 'animate-spin' : ''}`}
        />
      </div>
    </div>
  );
}

function ResultMessage({ result, message }: { result: "goal" | "save"; message: string }) {
  const isGoal = result === "goal";
  const bgColor = isGoal ? "bg-green-600/90 border-green-400" : "bg-red-600/90 border-red-400";

  return (
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-8 py-6 rounded-2xl backdrop-blur-md border-2 ${bgColor} animate-pulse shadow-2xl`}>
      <div className="text-7xl mb-3">{isGoal ? "🎉" : "❌"}</div>
      <div className="text-3xl font-bold text-white">{message}</div>
    </div>
  );
}

function Controls({
  done,
  active,
  score,
  onKick,
  onReset,
  endGameMessage,
}: {
  done: boolean;
  active: boolean;
  score: number;
  onKick: (dir: Direction) => void;
  onReset: () => void;
  endGameMessage: { emoji: string; text: string };
}) {
  if (done) {
    return <EndGameScreen score={score} endGameMessage={endGameMessage} onReset={onReset} />;
  }

  return (
    <div className="p-8">
      <div className="text-center mb-6 text-neutral-300 text-lg">
        방향을 선택하고 골을 넣어보세요!
      </div>
      <div className="grid grid-cols-3 gap-4">
        <KickButton direction="left" label="⬅️ 왼쪽" active={active} onClick={() => onKick("left")} />
        <KickButton direction="center" label="⬆️ 중앙" active={active} onClick={() => onKick("center")} />
        <KickButton direction="right" label="오른쪽 ➡️" active={active} onClick={() => onKick("right")} />
      </div>
    </div>
  );
}

function KickButton({ direction, label, active, onClick }: {
  direction: Direction;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className="px-8 py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
    >
      {label}
    </button>
  );
}

function EndGameScreen({
  score,
  endGameMessage,
  onReset,
}: {
  score: number;
  endGameMessage: { emoji: string; text: string };
  onReset: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="text-5xl mb-4">{endGameMessage.emoji}</div>
      <div className="text-4xl font-bold mb-4">게임 종료!</div>
      <div className="text-2xl text-neutral-400 mb-6">
        총 <span className="text-green-400 font-bold">{score}</span>골을 넣었습니다!
      </div>
      <div className="text-lg text-neutral-500 mb-6">{endGameMessage.text}</div>
      <button
        onClick={onReset}
        className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        🔄 다시 하기
      </button>
    </div>
  );
}

function Instructions() {
  return (
    <div className="mt-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400">
      <h3 className="font-semibold mb-2 text-neutral-300">게임 방법:</h3>
      <ul className="space-y-1 list-disc list-inside">
        <li>총 5번의 기회가 주어집니다</li>
        <li>골키퍼는 랜덤으로 방향을 선택합니다</li>
        <li>골키퍼와 다른 방향을 선택하면 골을 넣을 수 있습니다</li>
        <li>최대한 많은 골을 넣어보세요!</li>
      </ul>
    </div>
  );
}
