import type { Deck } from './decks.ts'

export const PAIRS_PER_ROUND = 8

export type Card = { id: number; emoji: string; pair: number; color: string }

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pastel = () => `hsl(${Math.floor(Math.random() * 360)} 75% 85%)`

export function newRound(deck: Deck): Card[] {
  const cards = shuffle(deck.pairs)
    .slice(0, PAIRS_PER_ROUND)
    .flatMap(([a, b], pair) => [
      { id: pair * 2, emoji: a, pair, color: pastel() },
      { id: pair * 2 + 1, emoji: b, pair, color: pastel() },
    ])
  return shuffle(cards)
}

export const isMatch = (a: Card, b: Card) => a.id !== b.id && a.pair === b.pair

// Overlap area of two rects; 0 when they don't touch.
export function overlap(a: DOMRect, b: DOMRect): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return w > 0 && h > 0 ? w * h : 0
}
