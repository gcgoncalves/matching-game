import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decks } from './decks.ts'
import { newRound, isMatch, overlap, PAIRS_PER_ROUND } from './game.ts'

test('every deck has enough pairs for a round', () => {
  for (const d of decks) assert.ok(d.pairs.length >= PAIRS_PER_ROUND, d.category)
})

test('similar decks pair identical emoji', () => {
  for (const d of decks.filter((d) => d.mode === 'similar')) for (const [a, b] of d.pairs) assert.equal(a, b)
})

test('round has 16 cards, each with exactly one partner', () => {
  const cards = newRound(decks[4])
  assert.equal(cards.length, PAIRS_PER_ROUND * 2)
  for (const c of cards) assert.equal(cards.filter((o) => isMatch(c, o)).length, 1)
  assert.equal(isMatch(cards[0], cards[0]), false)
})

test('overlap', () => {
  const r = (x: number, y: number) => ({ left: x, top: y, right: x + 10, bottom: y + 10 }) as DOMRect
  assert.equal(overlap(r(0, 0), r(5, 5)), 25)
  assert.equal(overlap(r(0, 0), r(10, 0)), 0)
})
