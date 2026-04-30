<template>
  <section
    id="weapons"
    class="relative overflow-hidden bg-bg-0 py-32"
    data-screen-label="01 Weapons"
  >
    <!-- Decorative numeric watermark (replaces KR rune per design source) -->
    <span
      class="pointer-events-none absolute right-[3%] top-[12%] font-display text-[clamp(280px,38vw,520px)] font-black italic leading-none text-gold/[0.025] select-none"
      aria-hidden="true"
    >I</span>

    <div class="mx-auto max-w-7xl px-6">
      <!-- ── Section header ──────────────────────────── -->
      <header
        class="mb-20 flex flex-col items-center gap-4 text-center"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <div class="section-eyebrow">
          <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
          <span><span class="num">01</span>&nbsp;&nbsp;ARSENAL</span>
          <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
        </div>
        <h2 class="section-title">{{ t('weapons.title') }}</h2>
        <p class="text-ink-soft max-w-[640px] leading-relaxed">{{ t('weapons.subtitle') }}</p>
      </header>

      <!-- ── Tabs (top) ──────────────────────────────── -->
      <div
        class="mb-12 flex flex-wrap justify-center gap-2"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 700, delay: 150 } }"
      >
        <button
          v-for="(weapon, idx) in weapons"
          :key="weapon.id"
          type="button"
          class="group relative flex items-center gap-3 rounded-full border px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] transition-all duration-400"
          :class="activeIdx === idx
            ? 'border-gold bg-gold/10 text-gold-bright shadow-[0_0_24px_rgba(232,181,71,0.25)]'
            : 'border-ink/15 bg-bg-1/40 text-ink-soft hover:border-gold/40 hover:text-gold'"
          @click="setActive(idx)"
        >
          <span class="font-display text-base font-bold opacity-70">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span>{{ localizedName(weapon) }}</span>
          <span
            v-if="activeIdx === idx"
            class="absolute -bottom-px left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </button>
      </div>

      <!-- ── Active weapon panel ─────────────────────── -->
      <div
        class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20"
        :key="activeIdx"
      >
        <!-- ▼ Left: Character / weapon image with rotating rings -->
        <div class="relative aspect-[4/5] w-full max-w-[560px] mx-auto">
          <!-- Decorative numeric index behind image -->
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[clamp(180px,26vw,340px)] font-black italic leading-none text-gold/[0.06] select-none"
            aria-hidden="true"
          >{{ String(activeIdx + 1).padStart(2, '0') }}</span>

          <!-- 3 concentric rings -->
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span
              class="absolute aspect-square w-[92%] rounded-full border border-gold/20"
              style="animation: ring-rotate 36s linear infinite;"
            >
              <span class="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(232,181,71,0.7)]" />
            </span>
            <span
              class="absolute aspect-square w-[78%] rounded-full border border-dashed border-gold/15"
              style="animation: ring-rotate-rev 48s linear infinite;"
            />
            <span
              class="absolute aspect-square w-[64%] rounded-full border border-gold/10"
            />
          </div>

          <!-- Image -->
          <Transition name="reveal" mode="out-in">
            <img
              :key="activeWeapon.id"
              :src="activeWeapon.image"
              :alt="localizedName(activeWeapon)"
              class="relative z-[1] h-full w-full object-contain drop-shadow-[0_0_60px_rgba(232,181,71,0.25)]"
              loading="lazy"
            />
          </Transition>

          <!-- Cinematic frame corners -->
          <div class="cinematic-corners absolute inset-0 z-[2]" />
        </div>

        <!-- ▼ Right: Weapon details -->
        <div class="flex flex-col gap-8">
          <Transition name="reveal" mode="out-in">
            <div :key="activeWeapon.id" class="flex flex-col gap-6">
              <div class="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute">
                <span class="text-gold-bright">{{ String(activeIdx + 1).padStart(2, '0') }} / {{ String(weapons.length).padStart(2, '0') }}</span>
                <span class="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                <span>{{ localizedRole(activeWeapon) }}</span>
              </div>

              <div class="flex flex-col gap-2">
                <h3 class="font-display text-[clamp(2rem,4vw,3rem)] font-bold italic leading-tight text-ink">
                  {{ localizedName(activeWeapon) }}
                </h3>
                <span class="font-mono text-gold/60 text-xs tracking-[0.4em] uppercase">
                  {{ localizedRole(activeWeapon) }}
                </span>
              </div>

              <p class="text-ink-soft leading-relaxed">{{ localizedDescription(activeWeapon) }}</p>

              <!-- Stat bars -->
              <div class="flex flex-col gap-4">
                <div
                  v-for="stat in activeWeapon.stats"
                  :key="stat.label"
                  class="flex flex-col gap-1.5"
                >
                  <div class="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
                    <span>{{ stat.label }}</span>
                    <span class="text-gold-bright">{{ stat.value }}<span class="text-ink-mute">/100</span></span>
                  </div>
                  <div class="relative h-px w-full overflow-hidden bg-ink/10">
                    <span
                      class="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                      :style="{ width: `${stat.value}%`, animation: 'stat-fill 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) both' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface WeaponStat { label: string; value: number }
interface WeaponItem {
  id: string
  nameEn: string
  nameTh: string
  roleEn: string
  roleTh: string
  descriptionEn: string
  descriptionTh: string
  image: string
  stats: WeaponStat[]
}

const props = defineProps<{
  items?: WeaponItem[]
}>()

const { t, locale } = useI18n()

const fallbackWeapons: WeaponItem[] = [
  {
    id: 'crimson-blade',
    nameEn: 'Crimson Blade',
    nameTh: 'ดาบโลหิตทมิฬ',
    roleEn: 'Vanguard',
    roleTh: 'แนวหน้า',
    descriptionEn: 'A blade forged in the blood of fallen kings. Strikes faster than thought.',
    descriptionTh: 'ดาบที่หล่อขึ้นจากเลือดของกษัตริย์ที่ล้มลง รวดเร็วกว่าความคิด',
    image: '/images/weapons/crimson-blade.webp',
    stats: [
      { label: 'Power', value: 92 },
      { label: 'Speed', value: 78 },
      { label: 'Range', value: 45 },
      { label: 'Mastery', value: 68 },
    ],
  },
  {
    id: 'void-bow',
    nameEn: 'Void Bow',
    nameTh: 'ธนูแห่งห้วงเหว',
    roleEn: 'Marksman',
    roleTh: 'นักล่า',
    descriptionEn: 'Arrows that pierce dimensions. Distance is no longer a barrier.',
    descriptionTh: 'ลูกธนูทะลุมิติ ระยะทางไม่ใช่อุปสรรคอีกต่อไป',
    image: '/images/weapons/void-bow.webp',
    stats: [
      { label: 'Power', value: 76 },
      { label: 'Speed', value: 88 },
      { label: 'Range', value: 96 },
      { label: 'Mastery', value: 72 },
    ],
  },
  {
    id: 'storm-staff',
    nameEn: 'Storm Staff',
    nameTh: 'ไม้เท้าพายุ',
    roleEn: 'Mage',
    roleTh: 'ผู้ใช้เวทย์',
    descriptionEn: 'Channel the wrath of seven storms in a single incantation.',
    descriptionTh: 'รวบรวมพลังพายุทั้งเจ็ดในคาถาเดียว',
    image: '/images/weapons/storm-staff.webp',
    stats: [
      { label: 'Power', value: 95 },
      { label: 'Speed', value: 52 },
      { label: 'Range', value: 84 },
      { label: 'Mastery', value: 89 },
    ],
  },
]

const weapons = computed<WeaponItem[]>(() => (props.items?.length ? props.items : fallbackWeapons))
const activeIdx = ref(0)
const activeWeapon = computed(() => weapons.value[activeIdx.value] || weapons.value[0])

function setActive(i: number) {
  activeIdx.value = i
}

function localizedName(w: WeaponItem) {
  return locale.value === 'th' ? (w.nameTh || w.nameEn) : (w.nameEn || w.nameTh)
}
function localizedRole(w: WeaponItem) {
  return locale.value === 'th' ? (w.roleTh || w.roleEn) : (w.roleEn || w.roleTh)
}
function localizedDescription(w: WeaponItem) {
  return locale.value === 'th' ? (w.descriptionTh || w.descriptionEn) : (w.descriptionEn || w.descriptionTh)
}
</script>
