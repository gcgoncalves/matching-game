<script lang="ts">
  import { flip } from 'svelte/animate'
  import { crossfade, scale } from 'svelte/transition'
  import { Spring } from 'svelte/motion'
  import { backOut, cubicOut } from 'svelte/easing'
  import type { Deck } from './decks.ts'
  import { newRound, isMatch, overlap, PAIRS_PER_ROUND, type Card } from './game.ts'

  let { deck, onagain, onmenu }: { deck: Deck; onagain: () => void; onmenu: () => void } = $props()

  // svelte-ignore state_referenced_locally -- App remounts Game (via {#key}) for a new round
  let cards = $state(newRound(deck))
  let matched = $state<[Card, Card][]>([])
  let dragId = $state<number | null>(null) // card being dragged, or springing back
  let dragging = $state(false)
  let hoverId = $state<number | null>(null)
  let shakeId = $state<number | null>(null)

  const offset = new Spring({ x: 0, y: 0 }, { stiffness: 0.12, damping: 0.55 })
  const els: Record<number, HTMLElement> = {}
  let start = { x: 0, y: 0 }

  const [send, receive] = crossfade({
    duration: 550,
    easing: cubicOut,
    fallback: (node) => scale(node, { duration: 250 }),
  })

  function down(e: PointerEvent, card: Card) {
    if (dragging) return
    dragId = card.id
    dragging = true
    offset.set({ x: 0, y: 0 }, { instant: true })
    start = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function move(e: PointerEvent) {
    if (!dragging || dragId === null) return
    offset.set({ x: e.clientX - start.x, y: e.clientY - start.y }, { instant: true })
    // Collision: the card with the biggest overlap is the drop target.
    const r = els[dragId].getBoundingClientRect()
    let best = 0
    hoverId = null
    for (const c of cards) {
      if (c.id === dragId) continue
      const o = overlap(r, els[c.id].getBoundingClientRect())
      if (o > best) [best, hoverId] = [o, c.id]
    }
  }

  function up() {
    if (!dragging) return
    dragging = false
    const a = cards.find((c) => c.id === dragId)!
    const b = cards.find((c) => c.id === hoverId)
    hoverId = null
    if (b && isMatch(a, b)) {
      matched.push([a, b])
      cards = cards.filter((c) => c.pair !== a.pair)
    } else {
      if (b) shakeId = b.id
      offset.target = { x: 0, y: 0 }
    }
  }

  const won = $derived(matched.length === PAIRS_PER_ROUND)
</script>

<main>
  <header>
    <button class="pill" onclick={onmenu}>← Menu</button>
    <h2>{deck.category}</h2>
    <span class="pill">{matched.length}/{PAIRS_PER_ROUND}</span>
  </header>

  <section class="board">
    {#each cards as card, i (card.id)}
      <div
        class="card"
        class:dragging={dragging && dragId === card.id}
        class:hover={hoverId === card.id}
        class:shake={shakeId === card.id}
        style:--c={card.color}
        style:transform={dragId === card.id ? `translate(${offset.current.x}px, ${offset.current.y}px)` : null}
        style:z-index={dragId === card.id ? 10 : null}
        {@attach (el) => { els[card.id] = el }}
        onpointerdown={(e) => down(e, card)}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
        onanimationend={() => (shakeId = null)}
        in:scale|global={{ delay: i * 35, duration: 350, start: 0.4, easing: backOut }}
        out:send={{ key: card.id }}
        animate:flip={{ duration: 400, easing: cubicOut }}
        role="img"
        aria-label={card.emoji}
      >
        {card.emoji}
      </div>
    {/each}

    {#if won}
      <div class="win" in:scale={{ delay: 500, duration: 400, easing: backOut }}>
        <p class="party">🎉</p>
        <h2>All matched!</h2>
        <div class="actions">
          <button class="pill big" onclick={onagain}>Play again</button>
          <button class="pill big" onclick={onmenu}>Menu</button>
        </div>
      </div>
    {/if}
  </section>

  <footer class="tracker">
    {#each { length: PAIRS_PER_ROUND }, i}
      <div class="slot">
        {#if matched[i]}
          {#each matched[i] as card (card.id)}
            <span class="mini" style:--c={card.color} in:receive={{ key: card.id }}>{card.emoji}</span>
          {/each}
        {/if}
      </div>
    {/each}
  </footer>
</main>

<style>
  main {
    --size: min(92vw, calc(100dvh - 15rem), 34rem);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    box-sizing: border-box;
  }

  header {
    width: var(--size);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
  }

  .board {
    position: relative;
    width: var(--size);
    aspect-ratio: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: calc((var(--size) - 3 * 0.75rem) / 4);
    gap: 0.75rem;
    margin: auto 0;
  }

  .card {
    background: var(--c);
    border-radius: 1.1rem;
    display: grid;
    place-items: center;
    font-size: calc(var(--size) / 9);
    box-shadow: 0 4px 0 rgb(0 0 0 / 0.06), 0 6px 16px rgb(120 90 160 / 0.15);
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    transition: scale 0.2s ease, box-shadow 0.2s ease;
  }

  .card.dragging {
    cursor: grabbing;
    scale: 1.06;
    box-shadow: 0 18px 36px rgb(120 90 160 / 0.3);
  }

  .card.hover {
    scale: 1.15;
    box-shadow: 0 0 0 4px white, 0 10px 24px rgb(120 90 160 / 0.3);
  }

  .card.shake {
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    20%, 60% { rotate: -8deg; }
    40%, 80% { rotate: 8deg; }
  }

  .tracker {
    width: min(100%, 44rem);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4.25rem, 1fr));
    gap: 0.5rem;
    padding: 0.75rem;
    box-sizing: border-box;
    background: var(--surface);
    border-radius: 1.25rem;
  }

  .slot {
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.2rem;
    border: 2px dashed var(--line);
    border-radius: 0.75rem;
  }

  .slot:has(.mini) {
    border-color: transparent;
  }

  .mini {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    font-size: 1.2rem;
    border-radius: 0.5rem;
    background: var(--c);
  }

  .win {
    position: absolute;
    inset: 15%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: var(--surface);
    border-radius: 2rem;
    box-shadow: 0 20px 50px rgb(120 90 160 / 0.25);
  }

  .party {
    font-size: 3.5rem;
    margin: 0;
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    50% { translate: 0 -0.75rem; }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
