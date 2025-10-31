"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

type Direction = "left" | "center" | "right";
type GamePhase = "aiming" | "charging" | "kicking" | "result" | "ended";

const GAME_CONFIG = {
  maxAttempts: 5,
  resultDisplayTime: 2500,
  spinnerSpeed: 8, // degrees per frame for smooth rotation
  maxPower: 100,
  powerChargeSpeed: 1.5, // power units per frame (slower charging)
  minViablePower: 25, // Below this = too weak, goalkeeper always saves
  maxViablePower: 75, // Above this = too strong, ball goes over
};

const POSITION_CONFIG = {
  left: { x: 20, keeperX: "left-[5%]", label: "왼쪽" },
  center: { x: 50, keeperX: "left-1/2 -translate-x-1/2", label: "중앙" },
  right: { x: 80, keeperX: "right-[5%]", label: "오른쪽" },
};

export default function PenaltyKick() {
  // Game state
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("aiming");
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [msg, setMsg] = useState("");
  
  // Aiming state
  const [arrowRotation, setArrowRotation] = useState(0); // degrees
  const [lockedRotation, setLockedRotation] = useState(0); // locked rotation when direction selected
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  
  // Power state
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  
  // Ball animation state
  const [ballPos, setBallPos] = useState({ x: 50, y: 88 });
  const [ballSize, setBallSize] = useState(64);
  const [keeperDir, setKeeperDir] = useState<Direction>("center");
  
  // Audio refs
  const kickSound = useRef<HTMLAudioElement | null>(null);
  const goalSound = useRef<HTMLAudioElement | null>(null);
  const missSound = useRef<HTMLAudioElement | null>(null);
  const chantSound = useRef<HTMLAudioElement | null>(null);
  
  // Refs for intervals
  const spinnerInterval = useRef<NodeJS.Timeout | null>(null);
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Arrow spinner logic - continuously rotates
  useEffect(() => {
    if (phase === "aiming") {
      spinnerInterval.current = setInterval(() => {
        setArrowRotation((prev) => (prev + GAME_CONFIG.spinnerSpeed) % 360);
      }, 16); // ~60fps
      
      return () => {
        if (spinnerInterval.current) {
          clearInterval(spinnerInterval.current);
        }
      };
    }
  }, [phase]);

  // Calculate current direction from arrow rotation
  const getCurrentDirection = (rotation: number): Direction => {
    // Normalize to 0-360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    // Left: 210-330 degrees (pointing left-ish)
    // Center: 330-30 degrees (pointing up)
    // Right: 30-150 degrees (pointing right-ish)
    
    if (normalizedRotation >= 240 && normalizedRotation < 300) {
      return "left";
    } else if ((normalizedRotation >= 300 && normalizedRotation <= 360) || (normalizedRotation >= 0 && normalizedRotation < 60)) {
      return "center";
    } else if (normalizedRotation >= 60 && normalizedRotation < 120) {
      return "right";
    }
    
    // Default during transition zones
    if (normalizedRotation >= 120 && normalizedRotation < 240) {
      return normalizedRotation < 180 ? "right" : "left";
    }
    
    return "center";
  };

  // Power charging logic
  useEffect(() => {
    if (isCharging && phase === "charging") {
      chargeInterval.current = setInterval(() => {
        setPower((prev) => {
          const newPower = prev + GAME_CONFIG.powerChargeSpeed;
          if (newPower >= GAME_CONFIG.maxPower) {
            return GAME_CONFIG.maxPower;
          }
          return newPower;
        });
      }, 16); // ~60fps
      
      return () => {
        if (chargeInterval.current) {
          clearInterval(chargeInterval.current);
        }
      };
    }
  }, [isCharging, phase]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      
      if (phase === "aiming") {
        // Lock direction based on current arrow rotation
        const direction = getCurrentDirection(arrowRotation);
        setSelectedDirection(direction);
        setLockedRotation(arrowRotation); // Lock the arrow rotation
        setPhase("charging");
        setIsCharging(true);
      }
    }
  }, [phase, arrowRotation]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" && phase === "charging") {
      e.preventDefault();
      // Release space to kick
      setIsCharging(false);
      executeKick();
    }
  }, [phase, power, selectedDirection]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const executeKick = async () => {
    if (!selectedDirection) return;
    
    setPhase("kicking");
    playSound(kickSound.current);
    
    // Check if power is in viable range
    const isTooWeak = power < GAME_CONFIG.minViablePower;
    const isTooStrong = power > GAME_CONFIG.maxViablePower;
    
    // Calculate ball trajectory based on power
    const targetX = POSITION_CONFIG[selectedDirection].x;
    let targetY = calculateTargetY(power);
    
    // If too strong, ball goes way over (skyrockets)
    if (isTooStrong) {
      targetY = 10; // Very high, out of goal
    }
    
    // Animate ball
    animateBall(targetX, targetY, isTooStrong);
    
    // Call backend
    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/penalty-kick/?choice=${selectedDirection}&power=${Math.round(power)}&tooWeak=${isTooWeak}&tooStrong=${isTooStrong}`);
        const data = await res.json();
        
        // Parse keeper direction (format: "left", "right", "center" or with "_low"/"_high")
        const keeperBaseDir = data.keeper_choice.split('_')[0] as Direction;
        setKeeperDir(keeperBaseDir);
        
        // Determine result based on power
        let finalResult: "goal" | "save";
        let finalMessage: string;
        
        if (isTooWeak) {
          finalResult = "save";
          finalMessage = "너무 약해요! 골키퍼가 쉽게 막았습니다! 💪";
        } else if (isTooStrong) {
          finalResult = "save";
          finalMessage = "너무 강해요! 공이 골대 위로 날아갔습니다! 🚀";
        } else {
          finalResult = data.goal ? "goal" : "save";
          finalMessage = data.message;
        }
        
        setResult(finalResult);
        setMsg(finalMessage);
        setPhase("result");
        
        playSound(finalResult === "goal" ? goalSound.current : missSound.current);
        
        if (finalResult === "goal") {
          setScore(score + 1);
        }
        
        setAttempts(attempts + 1);
        
        // Reset after showing result
        setTimeout(() => {
          if (attempts + 1 >= GAME_CONFIG.maxAttempts) {
            setPhase("ended");
          } else {
            resetRound();
          }
        }, GAME_CONFIG.resultDisplayTime);
      } catch (error) {
        console.error("Error:", error);
        resetRound();
      }
    }, 600);
  };

  const calculateTargetY = (powerLevel: number) => {
    // Power 0 = low (75%), Power 50 = mid (60%), Power 100 = high (40%)
    const minY = 40; // High shot
    const maxY = 75; // Low shot
    const midY = 60; // Medium shot (at power 50)
    
    // Create a curve where medium power (50) hits middle
    const normalizedPower = powerLevel / 100;
    
    if (normalizedPower <= 0.5) {
      // 0-50 power: low to mid
      return maxY - (maxY - midY) * (normalizedPower * 2);
    } else {
      // 50-100 power: mid to high
      return midY - (midY - minY) * ((normalizedPower - 0.5) * 2);
    }
  };

  const animateBall = (targetX: number, targetY: number, isTooStrong = false) => {
    const startX = 50;
    const startY = 88;
    const startSize = 64;
    const endSize = isTooStrong ? 20 : 32; // Smaller if it skyrockets
    const duration = isTooStrong ? 800 : 500; // Slower if going over
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY - (startY - targetY) * progress;
      const currentSize = startSize - (startSize - endSize) * progress;
      
      setBallPos({ x: currentX, y: currentY });
      setBallSize(currentSize);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const resetRound = () => {
    setBallPos({ x: 50, y: 88 });
    setBallSize(64);
    setKeeperDir("center");
    setResult(null);
    setMsg("");
    setSelectedDirection(null);
    setLockedRotation(0);
    setPower(0);
    setPhase("aiming");
  };

  const reset = () => {
    setScore(0);
    setAttempts(0);
    resetRound();
  };

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
    <div className="fixed inset-0 bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Full Screen Game Field */}
      <div className="absolute inset-0">
        {/* Stadium Background */}
        <Image
          src="/images/soccer/penalty_pov.jpg"
          alt="Penalty view"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Goalkeeper - scaled to screen */}
      <div className={`absolute transition-all duration-500 ease-out bottom-[15%] ${POSITION_CONFIG[keeperDir].keeperX}`}>
        <div className="relative w-[18vw] h-[18vw] min-w-[180px] min-h-[180px] max-w-[400px] max-h-[400px]">
          <Image
            src={getKeeperImage()}
            alt="Goalkeeper"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Soccer Ball - scaled to screen */}
      <div
        className="absolute transition-all duration-500 ease-out z-20"
        style={{
          left: `${ballPos.x}%`,
          top: `${ballPos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="relative transition-all duration-300"
          style={{ 
            width: `${ballSize * 1.2}px`, 
            height: `${ballSize * 1.2}px`,
            maxWidth: '120px',
            maxHeight: '120px'
          }}
        >
          <Image
            src="/images/soccer/soccer_ball.png"
            alt="Soccer ball"
            fill
            className={`object-contain drop-shadow-2xl ${phase === "kicking" ? 'animate-spin' : ''}`}
          />
        </div>
      </div>

      {/* Score Board - Top */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="text-center">
              <div className="text-xs text-neutral-400 mb-1">골 득점</div>
              <div className="text-3xl font-bold text-green-400 tabular-nums">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">⚽ 페널티킥</div>
              <div className="text-xs text-neutral-400">{attempts}/{GAME_CONFIG.maxAttempts}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400 mb-1">남은 기회</div>
              <div className="text-3xl font-bold tabular-nums">{GAME_CONFIG.maxAttempts - attempts}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls - Bottom */}
      {phase !== "ended" && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-8">
              {(phase === "aiming" || phase === "charging") && (
                <div className="space-y-6">
                  {/* Direction Spinner - Simple Rotating Arrow */}
                  {(phase === "aiming" || phase === "charging") && (
                    <div className="text-center mb-6">
                      {/* Simple Spinning Arrow */}
                      <div className="flex items-center justify-center">
                        <div
                          className="transition-transform duration-75"
                          style={{ 
                            transform: `rotate(${phase === "aiming" ? arrowRotation : lockedRotation}deg)`,
                          }}
                        >
                          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
                            {/* Arrow shaft */}
                            <line 
                              x1="100" 
                              y1="100" 
                              x2="100" 
                              y2="170" 
                              stroke="#10b981" 
                              strokeWidth="12" 
                              strokeLinecap="round"
                            />
                            {/* Arrow head */}
                            <polygon 
                              points="100,185 75,155 125,155" 
                              fill="#10b981"
                            />
                            {/* Center dot */}
                            <circle 
                              cx="100" 
                              cy="100" 
                              r="10" 
                              fill="#22c55e"
                              stroke="#fff"
                              strokeWidth="3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Power Gauge */}
                  {phase === "charging" && (
                    <div className="text-center">
                      <div className="max-w-md mx-auto">
                        <div className="relative h-16 bg-neutral-800 rounded-full overflow-hidden border-4 border-neutral-600">
                          {/* Power fill */}
                          <div
                            className="absolute top-0 left-0 h-full transition-all duration-75"
                            style={{ 
                              width: `${power}%`,
                              background: power < GAME_CONFIG.minViablePower 
                                ? '#ef4444' // Red for too weak
                                : power > GAME_CONFIG.maxViablePower
                                ? '#f59e0b' // Orange for too strong
                                : 'linear-gradient(to right, #10b981, #22c55e)' // Green for good range
                            }}
                          />
                          
                          {/* Accurate zone backgrounds */}
                          <div className="absolute inset-0 flex">
                            {/* Too weak zone (0-25%) */}
                            <div 
                              className="h-full bg-red-900/20"
                              style={{ width: '25%' }}
                            />
                            {/* Good zone (25-75%) */}
                            <div 
                              className="h-full bg-green-900/20"
                              style={{ width: '50%' }}
                            />
                            {/* Too strong zone (75-100%) */}
                            <div 
                              className="h-full bg-orange-900/20"
                              style={{ width: '25%' }}
                            />
                          </div>
                          
                          {/* Power zone labels */}
                          <div className="absolute inset-0 flex items-center">
                            <div 
                              className="flex items-center justify-center text-xs font-bold text-white drop-shadow-lg"
                              style={{ width: '25%' }}
                            >
                              ❌약함
                            </div>
                            <div 
                              className="flex items-center justify-center text-sm font-bold text-white drop-shadow-lg"
                              style={{ width: '50%' }}
                            >
                              ✅ 적정 구간 ✅
                            </div>
                            <div 
                              className="flex items-center justify-center text-xs font-bold text-white drop-shadow-lg"
                              style={{ width: '25%' }}
                            >
                              🚀강함
                            </div>
                          </div>
                          
                          {/* Zone dividers */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white"
                            style={{ left: '25%' }}
                          />
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white"
                            style={{ left: '75%' }}
                          />
                        </div>
                        <div className="text-2xl font-bold text-white mt-3 tabular-nums">
                          파워: {Math.round(power)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Result Message */}
              {phase === "result" && result && (
                <div className="text-center">
                  <div
                    className={`inline-block px-8 py-6 rounded-2xl backdrop-blur-md border-2 ${
                      result === "goal"
                        ? "bg-green-600/90 border-green-400"
                        : "bg-red-600/90 border-red-400"
                    } animate-pulse shadow-2xl`}
                  >
                    <div className="text-7xl mb-3">{result === "goal" ? "🎉" : "❌"}</div>
                    <div className="text-3xl font-bold text-white">{msg}</div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* End Game Screen */}
      {phase === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/70 backdrop-blur-sm">
          <div className="text-center px-8">
            <div className="text-7xl mb-6">{getEndGameMessage().emoji}</div>
            <div className="text-5xl font-bold mb-6 text-white">게임 종료!</div>
            <div className="text-3xl text-neutral-300 mb-8">
              총 <span className="text-green-400 font-bold">{score}</span>골을 넣었습니다!
            </div>
            <div className="text-xl text-neutral-400 mb-8">{getEndGameMessage().text}</div>
            <button
              onClick={reset}
              className="px-12 py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              🔄 다시 하기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
