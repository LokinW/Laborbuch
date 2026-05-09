import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { LaborbuchWordmark } from './Wordmark'
import { LogoutDialog } from './LogoutDialog'

export function AppHeader() {
  const { profile } = useAuth()
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const initial = (profile?.display_name ?? 'U').slice(0, 1).toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-black px-5 py-4 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <LaborbuchWordmark />
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          aria-label="Konto"
          className="rounded-full ring-offset-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          <Avatar className="h-8 w-8 bg-[#e0c8e8] text-black">
            <AvatarFallback className="bg-[#e0c8e8] text-base font-semibold text-white border-2 cursor-pointer hover:scale-[1.125] transition-transform">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </header>
  )
}
