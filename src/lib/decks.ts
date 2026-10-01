export type Mode = 'similar' | 'related'

export type Deck = { mode: Mode; category: string; pairs: [string, string][] }

// Each deck needs at least PAIRS_PER_ROUND pairs; extras make replays vary.
const same = (emojis: string): [string, string][] => [...new Intl.Segmenter().segment(emojis)].map(({ segment: e }) => [e, e])

export const decks: Deck[] = [
  { mode: 'similar', category: 'Animals', pairs: same('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯') },
  { mode: 'similar', category: 'Food', pairs: same('🍎🍌🍇🍓🍕🍔🍩🧁🥕🌽') },
  { mode: 'similar', category: 'Objects', pairs: same('☕🔑📚⏰🎈🎁🔦🧸🪑🎒') },
  { mode: 'similar', category: 'Nature', pairs: same('🌸🌻🌵🍄🌙⭐🌈🍁🌊🌲') },
  {
    mode: 'related',
    category: 'Animals & Food',
    pairs: [['🐒', '🍌'], ['🐰', '🥕'], ['🐝', '🍯'], ['🐭', '🧀'], ['🐶', '🦴'], ['🐱', '🐟'], ['🐿️', '🌰'], ['🐼', '🎋'], ['🐦', '🪱'], ['🐄', '🌾']],
  },
  {
    mode: 'related',
    category: 'Tools & Uses',
    pairs: [['🔑', '🔒'], ['🪥', '🦷'], ['🎣', '🐟'], ['🍳', '🥚'], ['🖌️', '🎨'], ['🎸', '🎵'], ['⚽', '🥅'], ['📷', '🖼️'], ['🔌', '💡'], ['✉️', '📮']],
  },
  {
    mode: 'related',
    category: 'Jobs',
    pairs: [['🧑‍🚒', '🚒'], ['🧑‍⚕️', '💉'], ['🧑‍🍳', '🍲'], ['🧑‍🌾', '🚜'], ['🧑‍🚀', '🚀'], ['👮', '🚓'], ['🧑‍🎨', '🖌️'], ['🧑‍🏫', '📚'], ['🧑‍✈️', '✈️'], ['🧑‍🔧', '🔧']],
  },
  {
    mode: 'related',
    category: 'Go Together',
    pairs: [['🥛', '🍪'], ['🧦', '👟'], ['🍞', '🧈'], ['🕯️', '🔥'], ['🎂', '🎉'], ['🐔', '🥚'], ['🌧️', '🌈'], ['🍝', '🧀'], ['🛏️', '😴'], ['🎤', '🎶']],
  },
]
