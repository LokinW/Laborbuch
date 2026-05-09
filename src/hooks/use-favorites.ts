import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

export function useFavorites(userId: string | undefined) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['favorites', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('machine_id')
        .eq('user_id', userId!)
      if (error) throw error
      return new Set((data ?? []).map((r) => r.machine_id))
    },
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      userId: string
      machineId: string
      isFavorite: boolean
    }) => {
      if (payload.isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', payload.userId)
          .eq('machine_id', payload.machineId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: payload.userId,
          machine_id: payload.machineId,
        })
        if (error) throw error
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['favorites', vars.userId] })
    },
  })
}
