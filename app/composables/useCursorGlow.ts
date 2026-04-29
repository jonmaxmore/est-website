/**
 * useCursorGlow — gold radial glow that follows the cursor on desktop.
 * Auto-disabled on touch devices and when prefers-reduced-motion is set.
 *
 * Usage: call once in a page setup block (e.g. app/pages/index.vue).
 *   useCursorGlow()
 */
export function useCursorGlow() {
  if (import.meta.server) return

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const el = document.createElement('div')
    el.className = 'cursor-glow'
    el.style.opacity = '0'
    document.body.appendChild(el)

    let rafId = 0
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      el.style.opacity = '1'
    }
    const onLeave = () => { el.style.opacity = '0' }

    const tick = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      el.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    tick()

    onUnmounted(() => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId)
      el.remove()
    })
  })
}
