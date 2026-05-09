import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

export type CommentWithUser = {
  id: string
  machine_id: string
  user_id: string
  body: string
  created_at: string
  display_name: string
}

export function useCommentCounts() {
  return useQuery({
    queryKey: ['comments', 'counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('machine_id')
      if (error) throw error
      const counts = new Map<string, number>()
      for (const row of data ?? []) {
        counts.set(row.machine_id, (counts.get(row.machine_id) ?? 0) + 1)
      }
      return counts
    },
    staleTime: 30_000,
  })
}

type CommentJoinRow = {
  id: string
  machine_id: string
  user_id: string
  body: string
  created_at: string
  profiles: { display_name: string } | null
}

export function useMachineComments(machineId: string | null) {
  return useQuery({
    enabled: !!machineId,
    queryKey: ['comments', 'machine', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, machine_id, user_id, body, created_at, profiles(display_name)')
        .eq('machine_id', machineId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as unknown as CommentJoinRow[]
      return rows.map<CommentWithUser>((c) => ({
        id: c.id,
        machine_id: c.machine_id,
        user_id: c.user_id,
        body: c.body,
        created_at: c.created_at,
        display_name: c.profiles?.display_name ?? 'Unbekannt',
      }))
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      machineId: string
      userId: string
      body: string
    }) => {
      const { error } = await supabase.from('comments').insert({
        machine_id: payload.machineId,
        user_id: payload.userId,
        body: payload.body,
      })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', 'counts'] })
      qc.invalidateQueries({
        queryKey: ['comments', 'machine', vars.machineId],
      })
    },
  })
}
