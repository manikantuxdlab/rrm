import * as React from "react"
import { useLocation } from "react-router-dom"
import gsap from "gsap"

interface GsapPageTransitionProps {
  children: React.ReactNode
  transitionKey?: string
  className?: string
  duration?: number
  yOffset?: number
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

export function GsapPageTransition({
  children,
  transitionKey,
  className = "",
  duration = 0.25,
  yOffset = 8,
}: GsapPageTransitionProps) {
  const location = useLocation()
  const key = transitionKey ?? (location.pathname + location.search)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediately kill any ongoing tweens on this element to guarantee zero stuck states
    gsap.killTweensOf(el)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: yOffset,
          scale: 0.998,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          ease: "power2.out",
          force3D: true,
          // clearProps clears inline styles so no lingering transform affects modals, sticky headers, or fixed overlays
          clearProps: "transform,opacity,scale",
          overwrite: "auto",
        }
      )
    }, el)

    return () => {
      ctx.revert()
    }
  }, [key, duration, yOffset])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </div>
  )
}

