<template>
  <div ref="el">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  distance?: number
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'up',
  delay: 0,
  duration: 0.8,
  distance: 40,
})

const el = ref<HTMLElement | null>(null)
const { $gsap, $ScrollTrigger } = useNuxtApp()

onMounted(() => {
  if (!$gsap || !el.value) return

  const dirMap: Record<string, { x?: number; y?: number }> = {
    up: { y: props.distance },
    down: { y: -props.distance },
    left: { x: props.distance },
    right: { x: -props.distance },
  }

  $gsap.from(el.value, {
    ...dirMap[props.direction],
    opacity: 0,
    duration: props.duration,
    delay: props.delay,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: el.value,
      start: 'top 85%',
      once: true,
    },
  })
})
</script>
