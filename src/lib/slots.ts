// Booking model: hourly slots, fixed daily window.
export const SLOT_START_HOUR = 8
export const SLOT_END_HOUR = 20 // exclusive: last bookable hour starts at 19:00

export const SLOT_HOURS = Array.from(
  { length: SLOT_END_HOUR - SLOT_START_HOUR },
  (_, i) => SLOT_START_HOUR + i,
)

export function formatHour(h: number) {
  return `${h.toString().padStart(2, '0')}:00`
}

export function formatHourRange(startHour: number, endHourExclusive: number) {
  return `${startHour} - ${endHourExclusive} Uhr`
}

// Group an array of hours into runs of consecutive integers, ascending.
export function groupConsecutiveHours(hours: number[]): Array<[number, number]> {
  if (hours.length === 0) return []
  const sorted = [...hours].sort((a, b) => a - b)
  const runs: Array<[number, number]> = []
  let runStart = sorted[0]
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const h = sorted[i]
    if (h === prev + 1) {
      prev = h
      continue
    }
    runs.push([runStart, prev + 1])
    runStart = h
    prev = h
  }
  runs.push([runStart, prev + 1])
  return runs
}

// Format a YYYY-MM-DD string as a local date (no timezone shift).
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
