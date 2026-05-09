import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { LaborbuchWordmark } from '@/components/laborbuch/Wordmark'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login fehlgeschlagen'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-black px-6 py-5">
        <LaborbuchWordmark />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-5"
        >
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Anmelden</h1>
            <p className="text-sm text-muted-foreground">
              Melde dich mit deinem Laborbuch-Account an.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dein.name@beispiel.de"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Anmelden…' : 'Anmelden'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Account vergessen oder gewünscht? Frag im Fablab nach.
          </p>
        </form>
      </main>
    </div>
  )
}
