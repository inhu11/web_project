"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [t0, setT0] = useState<number | null>(null);
  const [epoch, setEpoch] = useState<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    let active = true;
    fetch("http://127.0.0.1:8000/api/time/")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setT0(performance.now());
        setEpoch(d.epoch);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!epoch || t0 == null) return;
    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      const dt = performance.now() - t0;
      const now = new Date(epoch + dt);
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const el = document.getElementById("clock");
      const dl = document.getElementById("date");
      if (el) el.textContent = `${hh}:${mm}:${ss}`;
      if (dl)
        dl.textContent = now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [epoch, t0]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
      <div className="px-6 py-10 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl font-medium text-neutral-400">Home</div>
          <div className="flex gap-4">
            <Link href="/quiz" className="text-sm text-orange-500 hover:text-orange-400 transition">
              Try Math Quiz →
            </Link>
            <Link href="/penalty" className="text-sm text-green-500 hover:text-green-400 transition">
              Penalty Kick ⚽
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-10 text-center">
          <div id="clock" className="text-7xl sm:text-8xl md:text-9xl font-semibold tracking-tight tabular-nums">--:--:--</div>
          <div id="date" className="mt-4 text-neutral-400 text-lg">Fetching time…</div>
        </div>
      </div>
    </div>
  );
}
