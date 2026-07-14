import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useNavScroll } from './useNavScroll'

function TestNavScroll() {
  const navRef = useRef<HTMLElement | null>(null)
  useNavScroll(navRef)
  return <nav ref={navRef} data-testid="nav" />
}

describe('useNavScroll', () => {
  const setScrollY = (value: number) => {
    Object.defineProperty(window, 'scrollY', {
      value,
      writable: true,
      configurable: true,
    })
    window.dispatchEvent(new Event('scroll'))
  }

  it('ajoute la classe cp-nav-reveal au montage', () => {
    render(<TestNavScroll />)
    expect(screen.getByTestId('nav')).toHaveClass('cp-nav-reveal')
  })

  it('cache la nav quand on défile vers le bas', () => {
    render(<TestNavScroll />)
    const nav = screen.getByTestId('nav')

    setScrollY(100)

    expect(nav).toHaveClass('cp-nav-hidden')
    expect(nav).not.toHaveClass('cp-nav-visible')
  })

  it('affiche la nav quand on défile vers le haut', () => {
    render(<TestNavScroll />)
    const nav = screen.getByTestId('nav')

    setScrollY(100)
    expect(nav).toHaveClass('cp-nav-hidden')

    setScrollY(50)
    expect(nav).toHaveClass('cp-nav-visible')
    expect(nav).not.toHaveClass('cp-nav-hidden')
  })
})
