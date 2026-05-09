import { MessageSquare, Pin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Machine } from '@/hooks/use-machines'

type Props = {
  machine: Machine
  status: 'free' | 'in-use'
  commentCount: number
  isFavorite: boolean
  onReserve: () => void
  onOpenComments: () => void
  onToggleFavorite: () => void
}

export function MachineCard({
  machine,
  status,
  commentCount,
  isFavorite,
  onReserve,
  onOpenComments,
  onToggleFavorite,
}: Props) {
  return (
    <article className="flex items-start justify-between gap-4 border-b border-border py-5 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold leading-tight">
            {machine.name}
          </h3>
          {machine.description && (
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          )}
          <p
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              status === 'free' ? 'text-success' : 'text-info',
            )}
          >
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                status === 'free' ? 'bg-success' : 'bg-info',
              )}
            />
            {status === 'free' ? 'Frei' : 'In Nutzung'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onReserve} size="default">
            Reservieren
          </Button>
          <Button
            variant="secondary"
            size="default"
            onClick={onOpenComments}
            aria-label={`Kommentare öffnen (${commentCount})`}
            className="gap-1.5 px-4"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">{commentCount}</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
            aria-pressed={isFavorite}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isFavorite && 'fill-current text-foreground',
              )}
            />
          </Button>
        </div>
      </div>

      <div className="hidden h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-secondary sm:flex">
        {machine.image_url ? (
          <img
            src={machine.image_url}
            alt=""
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">kein Bild</span>
        )}
      </div>
    </article>
  )
}
