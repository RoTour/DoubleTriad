<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { EndOfGameEvent } from '../../events/EndOfGameEvent';

	export let results: EndOfGameEvent.Data;
  const dispatch = createEventDispatcher();

  const newGame = () => {
    console.log('Continue');
    dispatch('continue');
  }
</script>

<div class="fixed top-0 left-0 h-screen w-screen bg-semi-transparent z-10 flex items-center">
	<div class="min-h-[30%] w-screen bg-amber-400 border-y-8 border-amber-200 z-20 flex flex-col py-12">
		<h1 class="text-3xl text-center">End of Game</h1>
		<div class="flex justify-around max-w-full md:w-[50%] md:m-auto items-center flex-1">
			{#if !results.isDraw}
				<div class="flex flex-col items-center">
					<h2 class="text-2xl">Winner</h2>
					<p>{results.winner.player.name}</p>
					<p>{results.winner.score}</p>
				</div>
				<div class="flex flex-col items-center">
					<h2 class="text-2xl">Loser</h2>
					<p>{results.loser.player.name}</p>
					<p>{results.loser.score}</p>
				</div>
			{/if}
			{#if results.isDraw}
        <div class="flex flex-col gap-4 items-center">
          <h2 class="text-2xl mt-4">Draw</h2>
          <div class="flex gap-4">
            {#each results.players as player}
              <div class="flex flex-col items-center">
                <p>{player.name}</p>
                <p>{player.score}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      </div>
    <button on:click={newGame} class="mt-8 px-8 py-4 bg-amber-800 w-fit m-auto rounded-md font-bold text-amber-200">CONTINUE</button>
	</div>
</div>

<style lang="postcss">
	.bg-semi-transparent {
		background-color: rgba(0, 0, 0, 0.5);
	}

</style>
