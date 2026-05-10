import { Button } from '@/components/ui/button'
import { formatHourRanges } from '@/lib/slots'
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

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getGermanMonth(dateStr: string) {
  const date = parseLocalDate(dateStr)
  return MONTHS[date.getMonth()]
}

function getDayOfMonth(dateStr: string) {
  const date = parseLocalDate(dateStr)
  return date.getDate()
}

type Props = {
  machine: Machine | undefined
  date: string
  runs: Array<[number, number]>
  onCancel: () => void
  cancelling: boolean
}

export function MyReservationCard({
  machine,
  date,
  runs,
  onCancel,
  cancelling,
}: Props) {
  return (
    <article className="relative bg-white flex flex-row overflow-hidden border-t sm:border-0 sm:outline sm:outline-1 sm:outline-border ">
      <div className="bg-green-400 px-8 flex flex-col content-center justify-center justify-items-center">
        <div
          className='text-md uppercase text-green-700'>{getGermanMonth(date)}</div>
        <div
          className='text-4xl font-bold leading-tight text-green-800'
        >{getDayOfMonth(date)}</div>
      </div>

      <div className="relative z-20 min-w-0 w-full space-y-3 flex flex-col gap-8 py-4 sm:px-4">
        <div className="space-y-0.5">
          <h3 className="text-md font-semibold leading-tight">
            {machine?.name ?? '—'}
          </h3>

          {machine?.description && (
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          )}

          <p className="text-sm font-regular text-muted-foreground">
            {formatHourRanges(runs)}
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
