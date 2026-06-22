// components/laborbuch/PaginatedCarousel.tsx
import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export function PaginatedCarousel({ items }: { items: React.ReactNode[] }) {
  // 2 per page (1 col × 2 rows) on mobile, 4 (2 col × 2 rows) at sm+.
  const [pageSize, setPageSize] = React.useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 640px)').matches
      ? 4
      : 2,
  )

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setPageSize(mq.matches ? 4 : 2)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const pages = React.useMemo(() => chunk(items, pageSize), [items, pageSize])

  const [api, setApi] = React.useState<CarouselApi>()
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  // Re-sync embla when the page count changes (e.g. crossing the breakpoint).
  React.useEffect(() => {
    api?.reInit()
  }, [api, pages.length])

  // One page (or none): skip the carousel chrome entirely.
  if (pages.length <= 1) {
    return <div className="grid gap-3 sm:grid-cols-2">{items}</div>
  }

  return (
    <div className="space-y-4">
      <Carousel setApi={setApi} opts={{ align: 'start' }}>
        <CarouselContent className='select-none'>
          {pages.map((page, i) => (
            <CarouselItem key={i}>
              <div className="grid gap-3 sm:grid-cols-2">{page}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-2">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Seite ${i + 1}`}
            aria-current={i === selected}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              i === selected ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
          />
        ))}
      </div>
    </div>
  )
}