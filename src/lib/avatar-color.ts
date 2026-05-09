// Deterministic, per-user pastel color used for the avatar and calendar dots.
// Hashes the user UUID into a fixed palette so every user has a stable color
// without needing a column in the profiles table.
const PALETTE = [
  '#e0c8e8', // lilac (the original avatar color)
  '#fcd5b5', // peach
  '#c8e6c9', // mint
  '#bbdefb', // sky
  '#fff59d', // butter
  '#ffcdd2', // rose
  '#d1c4e9', // violet
  '#b2dfdb', // sage
  '#ffe0b2', // apricot
  '#dcedc8', // lime
]

export function colorForUserId(userId: string | null | undefined): string {
  if (!userId) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}
