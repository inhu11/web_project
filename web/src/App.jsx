import { useEffect, useRef, useState } from 'react'

function App() {
  const [t0, setT0] = useState(null)
  const [serverEpoch, setServerEpoch] = useState(null)
  const raf = useRef(0)

  useEffect(() => {
    let active = true
    fetch('/api/time/')
      .then(r => r.json())
      .then(d => {
        if (!active) return
        setT0(performance.now())
        setServerEpoch(d.epoch)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!serverEpoch || t0 == null) return
    const tick = () => {
      raf.current = requestAnimationFrame(tick)
      const dt = performance.now() - t0
      const now = new Date(serverEpoch + dt)
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const date = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const el = document.getElementById('clock')
      const dl = document.getElementById('date')
      if (el) el.textContent = `${hh}:${mm}:${ss}`
      if (dl) dl.textContent = date
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [serverEpoch, t0])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
      <div className="px-6 py-10 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl font-medium text-neutral-400">Home</div>
          <div className="text-sm text-neutral-500">Clock</div>
        </div>
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-10 text-center">
          <div id="clock" className="text-7xl sm:text-8xl md:text-9xl font-semibold tracking-tight tabular-nums">--:--:--</div>
          <div id="date" className="mt-4 text-neutral-400 text-lg">Fetching time…</div>
        </div>
      </div>
    </div>
  )
}

export default App
