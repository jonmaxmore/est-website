/**
 * useParallax — applies layered parallax based on scroll Y position.
 * Pass a record of refs + their parallax factor (0 = static, 1 = scrolls
 * with page, negative = moves opposite to scroll, fractions = subtle).
 *
 * Usage:
 *   const bg = ref<HTMLElement>()
 *   const mid = ref<HTMLElement>()
 *   const fg = ref<HTMLElement>()
 *   useParallax([
 *     { el: bg, factor: 0.5 },
 *     { el: mid, factor: 0.25 },
 *     { el: fg, factor: 0.1 },
 *   ])
 */
import type { Ref } from 'vue'

interface ParallaxLayer {
  el: Ref<HTMLElement | null | undefined>
  factor: number
}

export function useParallax(layers: ParallaxLayer[]) {
  if (import.meta.server) return

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0
    let scrollY = window.scrollY

    const update = () => {
      for (const { el, factor } of layers) {
        const node = el.value
        if (!node) continue
        node.style.transform = `translate3d(0, ${scrollY * factor * -1}px, 0)`
      }
      rafId = 0
    }
    const onScroll = () => {
      scrollY = window.scrollY
      if (!rafId) rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    })
  })
}
