import { MessageSquare, Pin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Machine } from '@/hooks/use-machines'
import extrudor from '@/assets/extrudor.webp'

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
            {machine.name}
          </h3>
  
          {machine.description && (
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          )}
  
          <p
            className={cn(
              'flex items-center gap-1 text-sm font-regular',
              status === 'free' ? 'text-success' : 'text-info',
            )}
          >
            <span
              className={cn(
                'inline-block h-1 w-1 rounded-full',
                status === 'free' ? 'bg-success' : 'bg-info',
              )}
            />
            {status === 'free' ? 'Frei' : 'In Nutzung'}
          </p>
        </div>
  
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={onReserve} size="sm">
            Reservieren
          </Button>
  
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenComments}
            aria-label={`Kommentare öffnen (${commentCount})`}
            className="gap-1.5 px-4"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">{commentCount}</span>
          </Button>
  
          <Button
            variant="secondary"
            size="sm"
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
    </article>
  )
}
