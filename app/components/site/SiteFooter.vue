<template>
  <footer class="mt-[clamp(4rem,8vw,8rem)] border-t border-white/6 bg-surface-secondary">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 pb-8 pt-16 md:grid-cols-[1.5fr_2fr]">
      <!-- Brand -->
      <div>
        <img src="/images/logo.webp" alt="Eternal Tower Saga" class="mb-4 w-40" />
        <p class="mb-6 text-sm leading-relaxed text-white/60">{{ t('footer.copyright') }}</p>
        <div class="flex gap-2">
          <a
            v-for="(url, platform) in socialLinks"
            :key="platform"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="platform"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/60 no-underline transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            {{ platformIcon(platform as string) }}
          </a>
        </div>
      </div>

      <!-- Links -->
      <div class="grid auto-cols-fr grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-8">
        <div v-for="group in footerGroups" :key="group.title">
          <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white">{{ group.title }}</h4>
          <div class="flex flex-col gap-2.5">
            <NuxtLink
              v-for="link in group.links"
              :key="link.href"
              :to="link.href"
              class="text-sm text-white/60 no-underline transition-colors duration-200 hover:text-gold"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl border-t border-white/6 px-6 py-6 text-center text-xs text-white/40">
      {{ SITE.copyright }}
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SITE, SOCIAL_LINKS } from '~/shared/constants'
const { t } = useI18n()
const socialLinks = SOCIAL_LINKS
const footerGroups = [
  { title: t('nav.features'), links: [
    { href: '/weapons', label: t('nav.characters') },
    { href: '/game-guide', label: t('nav.features') },
    { href: '/gallery', label: 'Gallery' },
  ]},
  { title: t('nav.support'), links: [
    { href: '/faq', label: 'FAQ' },
    { href: '/support', label: t('nav.support') },
    { href: '/terms', label: t('footer.terms') },
    { href: '/privacy', label: t('footer.privacy') },
  ]},
]
function platformIcon(platform: string): string {
  const icons: Record<string, string> = { facebook: 'f', twitter: '𝕏', youtube: '▶', discord: 'D', line: 'L' }
  return icons[platform] || '•'
}
</script>
