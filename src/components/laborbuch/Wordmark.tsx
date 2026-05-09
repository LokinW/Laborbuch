// Plain text wordmark — swap for the pixel-font logo asset later.
export function LaborbuchWordmark({ className }: { className?: string }) {
  return (
    <span
      className={
        'inline-block select-none text-xl font-black tracking-tight text-white ' +
        (className ?? '')
      }
    >
      Laborbuch
    </span>
  )
}
