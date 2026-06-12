import { useEffect, useRef, useState } from 'react'

export type ScrollDirection = 'up' | 'down'

export function useScrollDirection(threshold = 12) {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const lastY = useRef<number>(0)
  const ticking = useRef<boolean>(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const y = window.scrollY
        const diff = y - lastY.current

        if (Math.abs(diff) >= threshold) {
          setDirection(diff > 0 ? 'down' : 'up')
          lastY.current = y
        }

        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return direction
}

