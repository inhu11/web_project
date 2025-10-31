"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/penalty");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-neutral-400">페널티킥 게임으로 이동 중...</div>
    </div>
  );
}
