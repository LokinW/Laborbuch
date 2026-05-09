import * as React from 'react'
import { toast } from 'sonner'

import { AppHeader } from '@/components/laborbuch/AppHeader'
import { MachineCard } from '@/components/laborbuch/MachineCard'
import { MyReservationCard } from '@/components/laborbuch/MyReservationCard'
import { BookSlotDialog } from '@/components/laborbuch/BookSlotDialog'
import { CommentsDialog } from '@/components/laborbuch/CommentsDialog'
import { useMachines, type Machine } from '@/hooks/use-machines'
import {
  useDeleteReservation,
  useUpcomingReservations,
} from '@/hooks/use-reservations'
import { useCommentCounts } from '@/hooks/use-comments'
import { useFavorites, useToggleFavorite } from '@/hooks/use-favorites'
import { useAuth } from '@/lib/auth'
import { dateKey, groupConsecutiveHours } from '@/lib/slots'

type MyBooking = {
  ids: string[]
  machineId: string
  date: string
  startHour: number
  endHourExclusive: number
}

// Combine consecutive same-machine, same-day reservations into one displayed booking.
function groupMyBookings(
  rows: { id: string; machine_id: string; slot_date: string; slot_hour: number }[],
): MyBooking[] {
  const buckets = new Map<
    string,
    { machineId: string; date: string; entries: { id: string; hour: number }[] }
  >()
  for (const r of rows) {
    const key = `${r.machine_id}|${r.slot_date}`
    if (!buckets.has(key)) {
      buckets.set(key, { machineId: r.machine_id, date: r.slot_date, entries: [] })
    }
    buckets.get(key)!.entries.push({ id: r.id, hour: r.slot_hour })
  }
  const out: MyBooking[] = []
  for (const bucket of buckets.values()) {
    const sorted = bucket.entries.sort((a, b) => a.hour - b.hour)
    const hours = sorted.map((e) => e.hour)
    const runs = groupConsecutiveHours(hours)
    for (const [start, endExcl] of runs) {
      const ids = sorted
        .filter((e) => e.hour >= start && e.hour < endExcl)
        .map((e) => e.id)
      out.push({
        ids,
        machineId: bucket.machineId,
        date: bucket.date,
        startHour: start,
        endHourExclusive: endExcl,
      })
    }
  }
  out.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.startHour - b.startHour,
  )
  return out
}

export default function DashboardPage() {
  const { user } = useAuth()
  const machinesQ = useMachines()
  const reservationsQ = useUpcomingReservations()
  const commentCountsQ = useCommentCounts()
  const favoritesQ = useFavorites(user?.id)
  const toggleFavorite = useToggleFavorite()
  const deleteReservation = useDeleteReservation()

  const [bookMachine, setBookMachine] = React.useState<Machine | null>(null)
  const [commentsMachine, setCommentsMachine] = React.useState<Machine | null>(
    null,
  )

  const machines = machinesQ.data ?? []
  const machinesById = React.useMemo(() => {
    const m = new Map<string, Machine>()
    for (const x of machines) m.set(x.id, x)
    return m
  }, [machines])

  const reservations = reservationsQ.data ?? []
  const myReservations = user
    ? reservations.filter((r) => r.user_id === user.id)
    : []
  const myBookings = React.useMemo(
    () => groupMyBookings(myReservations),
    [myReservations],
  )

  // "In Nutzung" = machine has a reservation right now (today, current hour).
  const todayKey = dateKey(new Date())
  const currentHour = new Date().getHours()
  const machinesInUse = React.useMemo(() => {
    const set = new Set<string>()
    for (const r of reservations) {
      if (r.slot_date === todayKey && r.slot_hour === currentHour) {
        set.add(r.machine_id)
      }
    }
    return set
  }, [reservations, todayKey, currentHour])

  const favorites = favoritesQ.data ?? new Set<string>()
  const favoriteMachines = machines.filter((m) => favorites.has(m.id))

  async function cancelBooking(b: MyBooking) {
    try {
      await Promise.all(
        b.ids.map((id) => deleteReservation.mutateAsync(id)),
      )
      toast.success('Buchung abgesagt.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Absagen fehlgeschlagen.'
      toast.error(message)
    }
  }

  function renderMachineCard(m: Machine) {
    return (
      <MachineCard
        key={m.id}
        machine={m}
        status={machinesInUse.has(m.id) ? 'in-use' : 'free'}
        commentCount={commentCountsQ.data?.get(m.id) ?? 0}
        isFavorite={favorites.has(m.id)}
        onReserve={() => setBookMachine(m)}
        onOpenComments={() => setCommentsMachine(m)}
        onToggleFavorite={() => {
          if (!user) return
          toggleFavorite.mutate({
            userId: user.id,
            machineId: m.id,
            isFavorite: favorites.has(m.id),
          })
        }}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-5 py-8">
      {(reservationsQ.isLoading || myBookings.length > 0) && (
        <Section title="Meine Termine">
          {reservationsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Lädt…</p>
          ) : (
            <div className="grid bg-card sm:grid-cols-2 lg:grid-cols-3">
              {myBookings.map((b) => (
                <MyReservationCard
                  key={`${b.machineId}-${b.date}-${b.startHour}`}
                  machine={machinesById.get(b.machineId)}
                  date={b.date}
                  startHour={b.startHour}
                  endHourExclusive={b.endHourExclusive}
                  cancelling={deleteReservation.isPending}
                  onCancel={() => cancelBooking(b)}
                />
              ))}
            </div>
          )}
        </Section>
      )}

        {favoriteMachines.length > 0 && (
          <Section title="Favorisierte Geräte">
            <div className="grid bg-card sm:grid-cols-2 lg:grid-cols-3">
              {favoriteMachines.map(renderMachineCard)}
            </div>
          </Section>
        )}

        <Section title="Alle Geräte">
          {machinesQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Lädt…</p>
          ) : machines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Geräte. Lege welche im Supabase-Dashboard an.
            </p>
          ) : (
            <div className="grid bg-card sm:grid-cols-2 lg:grid-cols-3">
              {machines.map(renderMachineCard)}
            </div>
          )}
        </Section>
      </main>

      <BookSlotDialog
        machine={bookMachine}
        open={!!bookMachine}
        onOpenChange={(o) => !o && setBookMachine(null)}
      />
      <CommentsDialog
        machine={commentsMachine}
        open={!!commentsMachine}
        onOpenChange={(o) => !o && setCommentsMachine(null)}
      />
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-medium">
        {title}
      </h2>
      {children}
    </section>
  )
}
