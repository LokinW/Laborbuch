import * as React from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAddComment, useMachineComments } from '@/hooks/use-comments'
import { useAuth } from '@/lib/auth'
import type { Machine } from '@/hooks/use-machines'

function formatRelative(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CommentsDialog({
  machine,
  open,
  onOpenChange,
}: {
  machine: Machine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useAuth()
  const comments = useMachineComments(machine?.id ?? null)
  const addComment = useAddComment()
  const [body, setBody] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setBody(''), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!machine) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !machine) return
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      await addComment.mutateAsync({
        machineId: machine.id,
        userId: user.id,
        body: trimmed,
      })
      setBody('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kommentar fehlgeschlagen.'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:rounded-3xl bg-white text-zinc-900">
        <DialogHeader className="border-zinc-200">
          <DialogTitle>{machine.name}</DialogTitle>
          <p className="text-sm text-zinc-500">Kommentare</p>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh]">
          <ul className="divide-y divide-zinc-200 px-6">
            {comments.isLoading && (
              <li className="py-6 text-sm text-zinc-500">Lädt…</li>
            )}
            {!comments.isLoading && (comments.data?.length ?? 0) === 0 && (
              <li className="py-6 text-sm text-zinc-500">
                Noch keine Kommentare. Schreib den ersten.
              </li>
            )}
            {comments.data?.map((c) => (
              <li key={c.id} className="space-y-1 py-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{c.display_name}</span>
                  <span className="text-xs text-zinc-500">
                    {formatRelative(c.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <DialogFooter className="border-zinc-200">
          <form onSubmit={submit} className="flex w-full flex-col gap-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Kommentar schreiben…"
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!body.trim() || addComment.isPending}
            >
              {addComment.isPending ? 'Senden…' : 'Kommentar senden'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
