/**
 * useMagneticHover — pulls an element toward the cursor when hovered.
 * Returns a ref to bind on the target element. Snaps back on mouseleave.
 *
 * Usage:
 *   const btnRef = useMagneticHover<HTMLButtonElement>(0.3) // 0.3 = strength
 *   <button ref="btnRef" class="btn-magnetic">…</button>
 *
 * Used by: Hero CTAs, CTASection.
 * No-op on touch devices and when prefers-reduced-motion is set.
 */
export function useMagneticHover<T extends HTMLElement = HTMLElement>(strength = 0.25) {
  const el = ref<T | null>(null)

  onMounted(() => {
    if (import.meta.server) return
    if (!el.value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const node = el.value
    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      node.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const onLeave = () => { node.style.transform = '' }

    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', onLeave)

    onUnmounted(() => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', onLeave)
    })
  })

  return el
}
