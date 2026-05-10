import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { colorForUserId } from '@/lib/avatar-color'
import { LaborbuchWordmark } from './Wordmark'
import { LogoutDialog } from './LogoutDialog'

export function AppHeader() {
  const { profile, user } = useAuth()
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const initial = (profile?.display_name ?? 'U').slice(0, 1).toUpperCase()
  const color = colorForUserId(user?.id)

  return (
    <header className="sticky top-0 z-30 px-5 py-4 text-white border-b-2 border-muted">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <LaborbuchWordmark />
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          aria-label="Konto"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          <Avatar className="h-8 w-8 text-black" style={{ background: color }}>
            <AvatarFallback
              className="text-base font-semibold border-2 border-muted-foreground cursor-pointer hover:scale-[1.125] transition-transform"
              style={{ background: color }}
            >
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </header>
  )
}
