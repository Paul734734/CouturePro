import { useEffect, useRef, type RefObject } from 'react'

export function useNavScroll(navRef: RefObject<HTMLElement | null>) {
  const lastY = useRef(0)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    nav.classList.add('cp-nav-reveal')

    const onScroll = () => {
      const currentY = window.scrollY
      if (currentY < 60) {
        nav.classList.remove('cp-nav-hidden')
        nav.classList.add('cp-nav-visible')
      } else if (currentY > lastY.current) {
        nav.classList.add('cp-nav-hidden')
        nav.classList.remove('cp-nav-visible')
      } else {
        nav.classList.remove('cp-nav-hidden')
        nav.classList.add('cp-nav-visible')
      }
      lastY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [navRef])
}

