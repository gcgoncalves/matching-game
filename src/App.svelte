<script lang="ts">
  import { scale } from 'svelte/transition'
  import { backOut } from 'svelte/easing'
  import { decks, type Deck, type Mode } from './lib/decks.ts'
  import { pastel } from './lib/game.ts'
  import Game from './lib/Game.svelte'

  let mode = $state<Mode>('similar')
  let deck = $state<Deck | null>(null)
  let round = $state(0)
</script>

{#if deck}
  {#key round}
    <Game {deck} onagain={() => round++} onmenu={() => (deck = null)} />
  {/key}
{:else}
  <main>
    <h1>Match Up</h1>

    <div class="modes">
      <button class="pill big" aria-pressed={mode === 'similar'} onclick={() => (mode = 'similar')}>Similar</button>
      <button class="pill big" aria-pressed={mode === 'related'} onclick={() => (mode = 'related')}>Related</button>
    </div>
    <p>{mode === 'similar' ? 'Drag each card onto its twin.' : 'Drag each card onto what it goes with.'}</p>

    {#key mode}
      <div class="categories">
        {#each decks.filter((d) => d.mode === mode) as d, i (d.category)}
          <button
            class="category"
            style:--c={pastel()}
            onclick={() => (deck = d)}
            in:scale|global={{ delay: i * 60, start: 0.6, easing: backOut }}
          >
            <span>{d.pairs[0][0]}{d.pairs[0][1]}</span>
            {d.category}
          </button>
        {/each}
      </div>
    {/key}
  </main>
{/if}

<style>
  main {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    box-sizing: border-box;
  }

  h1 {
    font-size: 3rem;
    margin: 0;
  }

  p {
    margin: 0;
  }

  .modes {
    display: flex;
    gap: 0.5rem;
  }

  .categories {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 11rem));
    gap: 0.75rem;
  }

  .category {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1.25rem 0.5rem;
    background: var(--c);
    border-radius: 1.25rem;
    font-size: 1.05rem;
    box-shadow: 0 4px 0 rgb(0 0 0 / 0.06);
    transition: scale 0.2s ease;
  }

  .category:hover {
    scale: 1.05;
  }

  .category span {
    font-size: 2.25rem;
  }
</style>
