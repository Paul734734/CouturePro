import { useEffect, useMemo, useState } from 'react'

export function useCountUp(params: {
  start?: number
  end: number
  durationMs?: number
  startWhen?: boolean
  easing?: (t: number) => number
}) {
  const {
    start = 0,
    end,
    durationMs = 1500,
    startWhen = true,
    easing = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  } = params

  const [value, setValue] = useState(start)

  const rafKey = useMemo(() => Symbol('countup'), [])

  useEffect(() => {
    if (!startWhen) return

    let raf = 0
    const startTime = performance.now()
    const from = start
    const to = end

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / durationMs)
      const k = easing(t)
      const next = from + (to - from) * k
      setValue(next)

      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void rafKey
    }
  }, [start, end, durationMs, easing, startWhen, rafKey])

  return value
}

