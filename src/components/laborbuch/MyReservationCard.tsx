import { Button } from '@/components/ui/button'
import { formatHourRange } from '@/lib/slots'
import type { Machine } from '@/hooks/use-machines'

const WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
]
const MONTHS = [
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

function formatGermanDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}. ${MONTHS[date.getMonth()]}`
}

type Props = {
  machine: Machine | undefined
  date: string
  startHour: number
  endHourExclusive: number
  onCancel: () => void
  cancelling: boolean
}

export function MyReservationCard({
  machine,
  date,
  startHour,
  endHourExclusive,
  onCancel,
  cancelling,
}: Props) {
  return (
    <article className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold leading-tight">
            {machine?.name ?? '—'}
          </h3>
          {machine?.description && (
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          )}
          <p className="text-sm font-medium text-success">
            {formatGermanDate(date)}, {formatHourRange(startHour, endHourExclusive)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="default"
          onClick={onCancel}
          disabled={cancelling}
          className="w-full sm:w-auto"
        >
          Absagen
        </Button>
      </div>
      {machine?.image_url && (
        <div className="hidden h-20 w-24 shrink-0 sm:block">
          <img
            src={machine.image_url}
            alt=""
            className="h-full w-full rounded-xl object-cover"
          />
        </div>
      )}
    </article>
  )
}
