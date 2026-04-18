/**
 * GSAP Plugin (Client-only)
 * - Used for deep scroll-linked parallax effects via ScrollTrigger
 * - Micro-interactions are handled by @vueuse/motion (v-motion directive)
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  return {
    provide: {
      gsap,
      ScrollTrigger,
    },
  }
})
