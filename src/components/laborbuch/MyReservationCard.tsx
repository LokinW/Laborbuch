import { Button } from '@/components/ui/button'
import { formatHourRange } from '@/lib/slots'
import type { Machine } from '@/hooks/use-machines'
import extrudor from '@/assets/extrudor.webp'

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
    <article className="relative bg-white overflow-hidden border-t py-6 sm:border-0 sm:outline sm:outline-1 sm:outline-border sm:px-6">
      <div className="absolute inset-y-0 right-0 z-0 w-2/3 translate-x-1/4">
        <img
          src={extrudor}
          alt=""
          className="h-full w-auto object-cover object-left"
        />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full bg-gradient-to-tr from-white to-white/0" />

      <div className="relative z-20 min-w-0 space-y-3 flex flex-col gap-8">
        <div className="space-y-0.5">
          <h3 className="text-md font-semibold leading-tight">
            {machine?.name ?? '—'}
          </h3>

          {machine?.description && (
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          )}

          <p className="text-sm font-regular text-success">
            {formatGermanDate(date)}, {formatHourRange(startHour, endHourExclusive)}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={cancelling}
        >
          Absagen
        </Button>
      </div>
    </article>
  )
}
