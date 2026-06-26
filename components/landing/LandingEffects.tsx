'use client'

import { useEffect, useRef } from 'react'

export function LandingEffects() {
  const auraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia(
      '(min-width: 900px) and (hover: hover) and (pointer: fine)',
    ).matches
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tavero-reveal]'),
    )

    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )

    revealElements.forEach((element) => {
      element.classList.add('tavero-reveal')
      if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
        element.classList.add('is-visible')
      } else {
        observer.observe(element)
      }
    })

    if (!finePointer || !auraRef.current) {
      return () => observer.disconnect()
    }

    const aura = auraRef.current
    let animationFrame = 0

    const moveAura = (event: PointerEvent) => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        aura.style.transform = `translate3d(${event.clientX - 180}px, ${event.clientY - 180}px, 0)`
        aura.style.opacity = '1'
      })
    }

    const hideAura = () => {
      aura.style.opacity = '0'
    }

    window.addEventListener('pointermove', moveAura, { passive: true })
    document.documentElement.addEventListener('mouseleave', hideAura)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', moveAura)
      document.documentElement.removeEventListener('mouseleave', hideAura)
    }
  }, [])

  return <div ref={auraRef} className="tavero-cursor-aura" aria-hidden="true" />
}
