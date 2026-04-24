<template>
  <div class="dtrp-wrapper">
    <!-- Header -->
    <div class="dtrp-header">
      <div class="dtrp-tz">⏰ Timezone: GMT+7 (Asia/Bangkok) — Server Time</div>
    </div>

    <div class="dtrp-body">
      <!-- Calendar -->
      <div class="dtrp-calendar">
        <div class="dtrp-cal-header">
          <button type="button" class="dtrp-nav" @click="prevMonth">‹</button>
          <span class="dtrp-month-label">{{ monthLabel }}</span>
          <button type="button" class="dtrp-nav" @click="nextMonth">›</button>
        </div>
        <div class="dtrp-cal-grid">
          <div v-for="day in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="day" class="dtrp-weekday">{{ day }}</div>
          <button
            v-for="cell in calendarDays"
            :key="cell.key"
            type="button"
            class="dtrp-day"
            :class="{
              'other-month': !cell.currentMonth,
              'is-today': cell.isToday,
              'is-past': cell.isPast && !allowPast,
              'is-start': cell.isStart,
              'is-end': cell.isEnd,
              'in-range': cell.inRange,
            }"
            :disabled="cell.isPast && !allowPast"
            @click="selectDay(cell.date)"
          >
            {{ cell.day }}
          </button>
        </div>
      </div>

      <!-- Time Inputs -->
      <div class="dtrp-times">
        <div class="dtrp-time-group">
          <label class="dtrp-time-label">Start</label>
          <div class="dtrp-time-value">
            <span class="dtrp-date-display">{{ startDateDisplay }}</span>
            <input type="time" :value="startTime" class="dtrp-time-input" @change="onStartTimeChange" />
          </div>
        </div>
        <div class="dtrp-arrow">→</div>
        <div class="dtrp-time-group">
          <label class="dtrp-time-label">End</label>
          <div class="dtrp-time-value">
            <span class="dtrp-date-display">{{ endDateDisplay }}</span>
            <input type="time" :value="endTime" class="dtrp-time-input" @change="onEndTimeChange" />
          </div>
        </div>
      </div>

      <!-- Duration info -->
      <div v-if="start && end" class="dtrp-duration">
        Duration: {{ durationText }}
      </div>

      <!-- Error -->
      <p v-if="errorMessage" class="dtrp-error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  start?: string | null
  end?: string | null
  allowPast?: boolean
}>()

const emit = defineEmits<{
  'update:start': [value: string]
  'update:end': [value: string]
}>()

const viewDate = ref(new Date())
const selectingEnd = ref(false)

// -- Computed from props --
const startDate = computed(() => props.start ? new Date(props.start) : null)
const endDate = computed(() => props.end ? new Date(props.end) : null)

const startTime = computed(() => startDate.value ? `${pad(startDate.value.getHours())}:${pad(startDate.value.getMinutes())}` : '00:00')
const endTime = computed(() => endDate.value ? `${pad(endDate.value.getHours())}:${pad(endDate.value.getMinutes())}` : '23:59')

const startDateDisplay = computed(() => startDate.value ? startDate.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select')
const endDateDisplay = computed(() => endDate.value ? endDate.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select')

const monthLabel = computed(() => {
  return viewDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const errorMessage = computed(() => {
  if (startDate.value && endDate.value && endDate.value <= startDate.value) {
    return 'End time must be after start time'
  }
  return ''
})

const durationText = computed(() => {
  if (!startDate.value || !endDate.value) return ''
  const diff = endDate.value.getTime() - startDate.value.getTime()
  if (diff <= 0) return 'Invalid'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainHours = hours % 24
    return `${days}d ${remainHours}h ${minutes}m`
  }
  return `${hours}h ${minutes}m`
})

// -- Calendar generation --
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells = []

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i)
    cells.push(makeCell(d, false, today))
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    cells.push(makeCell(d, true, today))
  }

  // Next month fill
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    cells.push(makeCell(d, false, today))
  }

  return cells
})

function makeCell(d: Date, currentMonth: boolean, today: Date) {
  const dateStr = d.toDateString()
  const sDate = startDate.value
  const eDate = endDate.value

  return {
    key: d.toISOString(),
    date: d,
    day: d.getDate(),
    currentMonth,
    isToday: d.getTime() === today.getTime(),
    isPast: d < today,
    isStart: sDate ? d.toDateString() === sDate.toDateString() : false,
    isEnd: eDate ? d.toDateString() === eDate.toDateString() : false,
    inRange: sDate && eDate ? d > sDate && d < eDate : false,
  }
}

function selectDay(date: Date) {
  if (!selectingEnd.value || !startDate.value) {
    // Set start date, keep existing time
    const h = startDate.value ? startDate.value.getHours() : 0
    const m = startDate.value ? startDate.value.getMinutes() : 0
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    emit('update:start', d.toISOString())
    selectingEnd.value = true
  } else {
    // Set end date
    const h = endDate.value ? endDate.value.getHours() : 23
    const m = endDate.value ? endDate.value.getMinutes() : 59
    const d = new Date(date)
    d.setHours(h, m, 0, 0)

    // If end is before start, swap
    if (d <= startDate.value!) {
      emit('update:end', props.start!)
      emit('update:start', d.toISOString())
    } else {
      emit('update:end', d.toISOString())
    }
    selectingEnd.value = false
  }
}

function onStartTimeChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const parts = val.split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const d = startDate.value ? new Date(startDate.value) : new Date()
  d.setHours(h, m, 0, 0)
  emit('update:start', d.toISOString())
}

function onEndTimeChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const parts = val.split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const d = endDate.value ? new Date(endDate.value) : new Date()
  d.setHours(h, m, 0, 0)
  emit('update:end', d.toISOString())
}

function prevMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}
function nextMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}

function pad(n: number) { return n.toString().padStart(2, '0') }
</script>

<style scoped>
.dtrp-wrapper {
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
  background: rgba(255,255,255,0.02); overflow: hidden;
}
.dtrp-header {
  padding: 10px 16px; background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.dtrp-tz {
  font-size: 0.6875rem; font-weight: 500;
  color: rgba(59,130,246,0.7);
}
.dtrp-body { padding: 16px; }

/* Calendar */
.dtrp-calendar { margin-bottom: 16px; }
.dtrp-cal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.dtrp-nav {
  width: 28px; height: 28px; border: none; border-radius: 6px;
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5);
  cursor: pointer; font-size: 1rem; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.dtrp-nav:hover { background: rgba(255,255,255,0.08); color: white; }
.dtrp-month-label { font-size: 0.875rem; font-weight: 600; }

.dtrp-cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.dtrp-weekday {
  text-align: center; font-size: 0.625rem; font-weight: 600;
  text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 4px;
}
.dtrp-day {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 8px; background: transparent;
  color: rgba(255,255,255,0.6); font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
}
.dtrp-day:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
.dtrp-day.other-month { color: rgba(255,255,255,0.15); }
.dtrp-day.is-today { border: 1px solid rgba(212,168,67,0.3); }
.dtrp-day.is-past { color: rgba(255,255,255,0.1); cursor: not-allowed; }
.dtrp-day.is-start { background: #d4a843; color: black; font-weight: 700; border-radius: 8px 4px 4px 8px; }
.dtrp-day.is-end { background: #d4a843; color: black; font-weight: 700; border-radius: 4px 8px 8px 4px; }
.dtrp-day.in-range { background: rgba(212,168,67,0.12); color: #d4a843; border-radius: 2px; }

/* Time inputs */
.dtrp-times {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.dtrp-time-group { flex: 1; }
.dtrp-time-label {
  display: block; font-size: 0.625rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 4px;
}
.dtrp-time-value {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; background: rgba(255,255,255,0.03);
}
.dtrp-date-display { font-size: 0.75rem; color: rgba(255,255,255,0.5); min-width: 50px; }
.dtrp-time-input {
  border: none; background: transparent; color: white; font-size: 0.875rem;
  font-weight: 600; outline: none; font-family: monospace; width: 65px;
}
.dtrp-arrow { color: rgba(255,255,255,0.2); font-size: 1rem; flex-shrink: 0; }

.dtrp-duration {
  text-align: center; font-size: 0.75rem; font-weight: 500;
  color: rgba(212,168,67,0.6); padding: 6px; border-radius: 6px;
  background: rgba(212,168,67,0.04);
}

.dtrp-error {
  margin-top: 8px; text-align: center; font-size: 0.75rem;
  color: #ef4444; font-weight: 500;
}
</style>
