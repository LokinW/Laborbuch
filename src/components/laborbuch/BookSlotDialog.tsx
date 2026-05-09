import * as React from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDayReservations, useCreateReservations } from '@/hooks/use-reservations'
import {
  SLOT_HOURS,
  dateKey,
  formatHour,
  formatHourRanges,
  groupConsecutiveHours,
  parseDateKey,
} from '@/lib/slots'
import { useAuth } from '@/lib/auth'
import type { Machine } from '@/hooks/use-machines'

const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const WEEKDAYS_LONG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
]
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Juni',
  'Juli',
  'Aug',
  'Sept',
  'Okt',
  'Nov',
  'Dez',
]

const DAYS_AHEAD = 60 // inclusive of today

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number) {
  const next = new Date(d)
  next.setDate(d.getDate() + n)
  return next
}

// Mo=0, Su=6 — for a Monday-first calendar grid.
function isoDayIndex(d: Date) {
  return (d.getDay() + 6) % 7
}

// Calendar from start of `today`'s month through end of the month containing the cutoff.
function buildCalendarDays(today: Date, cutoff: Date) {
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, 0)
  const days: Date[] = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function groupByMonth(days: Date[]) {
  const groups: Array<{ key: string; label: string; days: Date[] }> = []
  for (const d of days) {
    const key = `${d.getFullYear()}-${d.getMonth()}`
    let g = groups[groups.length - 1]
    if (!g || g.key !== key) {
      g = { key, label: MONTHS[d.getMonth()], days: [] }
      groups.push(g)
    }
    g.days.push(d)
  }
  return groups
}

type Step = 'day' | 'time'

export function BookSlotDialog({
  machine,
  open,
  onOpenChange,
}: {
  machine: Machine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useAuth()
  const [step, setStep] = React.useState<Step>('day')
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [selectedHours, setSelectedHours] = React.useState<number[]>([])

  const today = React.useMemo(() => startOfDay(new Date()), [])
  const cutoff = React.useMemo(() => addDays(today, DAYS_AHEAD - 1), [today])
  const days = React.useMemo(
    () => buildCalendarDays(today, cutoff),
    [today, cutoff],
  )
  const groups = React.useMemo(() => groupByMonth(days), [days])

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep('day')
        setSelectedDate(null)
        setSelectedHours([])
      }, 150)
      return () => clearTimeout(t)
    }
  }, [open])

  const dayReservations = useDayReservations(machine?.id ?? null, selectedDate)
  const createReservations = useCreateReservations()

  const bookedHours = new Map<number, string>()
  for (const r of dayReservations.data ?? []) {
    bookedHours.set(r.slot_hour, r.display_name)
  }

  function toggleHour(h: number) {
    if (bookedHours.has(h)) return
    setSelectedHours((prev) => {
      if (prev.includes(h)) return prev.filter((x) => x !== h)
      return [...prev, h]
    })
  }

  const sortedSelected = [...selectedHours].sort((a, b) => a - b)
  const selectedRuns = groupConsecutiveHours(sortedSelected)

  const summaryDate = selectedDate ? parseDateKey(selectedDate) : null
  const summary =
    summaryDate && selectedRuns.length > 0
      ? `${WEEKDAYS_LONG[summaryDate.getDay()]} ${summaryDate.getDate()}. ${MONTHS_SHORT[summaryDate.getMonth()]}, ${formatHourRanges(selectedRuns)}`
      : null

  async function confirm() {
    if (!machine || !user || !selectedDate || sortedSelected.length === 0) return
    try {
      await createReservations.mutateAsync({
        machineId: machine.id,
        userId: user.id,
        date: selectedDate,
        hours: sortedSelected,
      })
      toast.success('Buchung gespeichert.')
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Buchung fehlgeschlagen.'
      toast.error(message)
    }
  }

  if (!machine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:rounded-3xl bg-white text-zinc-900">
        <DialogHeader className="border-zinc-200">
          <DialogTitle>{machine.name}</DialogTitle>
          <p className="text-sm text-zinc-500">
            {step === 'day' ? 'Tag auswählen' : 'Zeitraum auswählen'}
          </p>
        </DialogHeader>

        {step === 'day' && (
          <ScrollArea className="max-h-[60vh]">
            <div className="px-6 pb-6 pt-4">
              <div className="sticky top-0 z-10 grid grid-cols-7 bg-white pb-2 pt-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
                {WEEKDAYS_SHORT.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <div className="space-y-8">
                {groups.map((group) => (
                  <section key={group.key}>
                    <h2 className="mb-3 text-2xl font-bold tracking-tight">
                      {group.label}
                    </h2>
                    <div className="grid grid-cols-7 gap-y-3 text-center">
                      {Array.from({ length: isoDayIndex(group.days[0]) }).map(
                        (_, i) => (
                          <div key={`pad-${i}`} />
                        ),
                      )}
                      {group.days.map((d) => {
                        const key = dateKey(d)
                        const inWindow = d >= today && d <= cutoff
                        const selected = key === selectedDate
                        const isToday = d.getTime() === today.getTime()
                        return (
                          <button
                            type="button"
                            key={key}
                            onClick={() => inWindow && setSelectedDate(key)}
                            disabled={!inWindow}
                            className={cn(
                              'mx-auto grid h-10 w-10 place-items-center rounded-full text-base font-medium transition-colors',
                              selected && 'bg-zinc-900 text-white',
                              !selected &&
                                inWindow &&
                                'text-zinc-900 hover:bg-zinc-100',
                              !selected &&
                                !inWindow &&
                                'cursor-not-allowed text-zinc-300',
                              isToday && !selected && 'ring-1 ring-zinc-300',
                            )}
                            aria-pressed={selected}
                            aria-label={`${WEEKDAYS_SHORT[isoDayIndex(d)]} ${d.getDate()}.`}
                          >
                            {d.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

        {step === 'time' && selectedDate && (
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-2 px-6 py-5">
              {SLOT_HOURS.map((h) => {
                const reservedBy = bookedHours.get(h)
                const isReserved = !!reservedBy
                const isSelected = sortedSelected.includes(h)
                return (
                  <button
                    type="button"
                    key={h}
                    onClick={() => toggleHour(h)}
                    disabled={isReserved}
                    className={cn(
                      'flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border px-4 py-3 text-base font-semibold transition-colors',
                      isReserved
                        ? 'cursor-not-allowed border-zinc-200 bg-white text-zinc-400'
                        : isSelected
                          ? 'border-transparent bg-success text-success-foreground'
                          : 'border-zinc-200 bg-white text-success hover:bg-zinc-50',
                    )}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={cn(
                        'flex items-center gap-2',
                        isReserved && 'text-zinc-400 line-through',
                      )}
                    >
                      {formatHour(h)}
                      {isSelected && <CheckIcon />}
                    </span>
                    {isReserved && (
                      <span className="text-sm font-normal text-zinc-500">
                        Reserviert von {reservedBy}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="border-zinc-200">
          {step === 'day' && (
            <>
              {summaryDate && (
                <p className="text-center text-sm text-zinc-500">
                  {WEEKDAYS_LONG[summaryDate.getDay()]}{' '}
                  {summaryDate.getDate()}. {MONTHS_SHORT[summaryDate.getMonth()]}
                </p>
              )}
              <Button
                size="lg"
                disabled={!selectedDate}
                onClick={() => setStep('time')}
              >
                Weiter
              </Button>
            </>
          )}
          {step === 'time' && (
            <>
              {summary && (
                <p className="text-center text-sm text-zinc-500">{summary}</p>
              )}
              <Button
                size="lg"
                disabled={
                  sortedSelected.length === 0 || createReservations.isPending
                }
                onClick={confirm}
              >
                {createReservations.isPending
                  ? 'Speichern…'
                  : 'Buchung abschließen'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep('day')}
              >
                Zurück
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
