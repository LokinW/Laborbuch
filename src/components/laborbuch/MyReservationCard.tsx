import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatHourRanges } from '@/lib/slots'
import type { Machine } from '@/hooks/use-machines'

const MONTHS = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
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
    <article className="relative bg-card flex flex-row overflow-hidden outline outline-1 outline-border rounded-lg">
      <div className="bg-card px-12 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold leading-tight tracking-tight text-primary">
          {getDayOfMonth(date)}
        </div>
        <div className="text-md uppercase text-red-600 leading-tight">
          {getGermanMonth(date)}
        </div>
      </div>
      <div className="relative min-w-0 w-full space-y-3 flex flex-col py-4 pr-4">
        <div className="space-y-0.5 pr-8">
          <h3 className="text-sm font-regular leading-tight">
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
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
            aria-label="Menü öffnen"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onCancel}
            disabled={cancelling}
            className="text-destructive focus:text-destructive on-hover:cursor-pointer"
          >
            Absagen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  )
}