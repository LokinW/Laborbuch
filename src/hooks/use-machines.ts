import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Machine = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  kit_link: string | null
}

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, description, image_url, kit_link')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data as Machine[]
    },
    staleTime: 60_000,
  })
}