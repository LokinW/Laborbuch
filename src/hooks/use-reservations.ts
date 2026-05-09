import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { dateKey } from '@/lib/slots'

export type Reservation = {
  id: string
  machine_id: string
  user_id: string
  slot_date: string
  slot_hour: number
}

export type ReservationWithUser = Reservation & {
  display_name: string
}

type ReservationJoinRow = {
  id: string
  machine_id: string
  user_id: string
  slot_date: string
  slot_hour: number
  profiles: { display_name: string } | null
}

// All upcoming reservations across machines (today onwards), with display name.
export function useUpcomingReservations() {
  const today = dateKey(new Date())
  return useQuery({
    queryKey: ['reservations', 'upcoming', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          'id, machine_id, user_id, slot_date, slot_hour, profiles(display_name)',
        )
        .gte('slot_date', today)
        .order('slot_date', { ascending: true })
        .order('slot_hour', { ascending: true })
      if (error) throw error
      const rows = (data ?? []) as unknown as ReservationJoinRow[]
      return rows.map<ReservationWithUser>((r) => ({
        id: r.id,
        machine_id: r.machine_id,
        user_id: r.user_id,
        slot_date: r.slot_date,
        slot_hour: r.slot_hour,
        display_name: r.profiles?.display_name ?? 'Unbekannt',
      }))
    },
    staleTime: 30_000,
  })
}

// Reservations for one machine on one date (for the time-slot picker).
export function useDayReservations(machineId: string | null, date: string | null) {
  return useQuery({
    enabled: !!machineId && !!date,
    queryKey: ['reservations', 'day', machineId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          'id, machine_id, user_id, slot_date, slot_hour, profiles(display_name)',
        )
        .eq('machine_id', machineId!)
        .eq('slot_date', date!)
      if (error) throw error
      const rows = (data ?? []) as unknown as ReservationJoinRow[]
      return rows.map<ReservationWithUser>((r) => ({
        id: r.id,
        machine_id: r.machine_id,
        user_id: r.user_id,
        slot_date: r.slot_date,
        slot_hour: r.slot_hour,
        display_name: r.profiles?.display_name ?? 'Unbekannt',
      }))
    },
  })
}

export function useCreateReservations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      machineId: string
      userId: string
      date: string
      hours: number[]
    }) => {
      const rows = payload.hours.map((h) => ({
        machine_id: payload.machineId,
        user_id: payload.userId,
        slot_date: payload.date,
        slot_hour: h,
      }))
      const { error } = await supabase.from('reservations').insert(rows)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

export function useDeleteReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reservations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
