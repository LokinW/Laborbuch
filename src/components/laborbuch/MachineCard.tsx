import { Star } from 'lucide-react'
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
    <article className="relative bg-card overflow-hidden outline outline-1 outline-border rounded-lg p-3 hover:bg-primary-foreground">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-9 justify-between">
          <div className="relative z-20 min-w-0 space-y-3 flex flex-col gap-8 h-28">
            <div className="min-w-0 space-y-0.5">
              <h3 className="flex items-center gap-0 text-lg font-regular leading-tight">
                <span className="min-w-0 truncate">{machine.name}</span>
                <p
                  className={cn(
                    'flex items-center gap-1 text-sm font-regular pl-2 pr-1',
                    status === 'free' ? 'text-success' : 'text-info',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full',
                      status === 'free' ? 'bg-success' : 'bg-info',
                    )}
                  />
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                    aria-pressed={isFavorite}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4 text-muted-foreground',
                        isFavorite && 'fill-current text-foreground',
                      )}
                    />
                </Button>
              </h3>
              {machine.description && (
                <p className="text-sm font-light tracking-wide text-muted-foreground line-clamp-2">
                  {machine.description}
                </p>
              )}
            </div>
          </div>
          <img
            src={machine.image_url ?? extrudor}
            alt=""
            className="shrink-0 h-24 w-24 object-cover object-center rounded-sm"
          />
        </div>
        <div className="flex flex-1 pt-3 items-center gap-2 border-t border-primary-foreground">
          <Button onClick={onReserve} size="sm" variant="ghost" className='text-muted-foreground'>
            Buchen
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenComments}
            aria-label={`Kommentare öffnen (${commentCount})`}
            className="gap-1.5 px-4 text-muted-foreground"
          >
            Kommentare
            <span className="text-sm font-medium">{commentCount}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}