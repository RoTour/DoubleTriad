<script lang="ts">
	import type { PlacedCard } from '../../aggregates/PlacedCard';
	import type { Player } from '../../aggregates/Player';

	export let data: PlacedCard | null = null;
	export let players: Player[] = [];

	$: card = data?.card;
	$: player = data?.player;
</script>

<button
	class:bg-red-300={player && player.name === players[0].name}
	class:bg-blue-300={player && player.name === players[1].name}
	class="h-full w-full relative border-2 border-black flex items-center justify-center rounded-lg"
	on:click
>
	{#if data && card && player}
		<p class="absolute top-0 left-1/2 -translate-x-1/2">{card.top}</p>
		<p class="absolute top-1/2 -translate-y-1/2 left-0">{card.left}</p>
		<p class="absolute top-1/2 -translate-y-1/2 right-0">{card.right}</p>
		<p class="absolute bottom-0 left-1/2 -translate-x-1/2">{card.bottom}</p>
		<p>{card.name}</p>
	{:else} 
		<p class="font-bold">Empty</p>
	{/if}
</button>
