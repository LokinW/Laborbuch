import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

export function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { profile, signOut } = useAuth()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abmelden?</DialogTitle>
          <DialogDescription>
            {profile
              ? `Du bist als ${profile.display_name} angemeldet.`
              : 'Aktuelle Sitzung beenden.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            size="lg"
            onClick={async () => {
              await signOut()
              onOpenChange(false)
            }}
          >
            Abmelden
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
