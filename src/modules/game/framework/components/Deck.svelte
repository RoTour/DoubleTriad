<script lang="ts">
	import type { Player } from '../../aggregates/Player';
	import type { Card } from '../../entities/Card';
	import { pickedCard } from '../stores/PickedCardStore.svelte';

	// svelte5
	type Props = {
		cards: Card[];
		owner: Player;
	};
	let { cards, owner }: Props = $props();

	const selectCard = (card: Card) => {
		if (pickedCard.card?.compare(card)) {
			pickedCard.set(null);
			return;
		}
		pickedCard.set(card);
	};

	$inspect('selectedCard', pickedCard.card);
</script>

{#snippet DeckCard(card: Card, index: number)}
	<button
		class="aspect-[63/88] border-2 border-black h-[20vh] flex justify-center
  absolute left-1/2 -translate-x-1/2 bg-white hover:scale-110 cursor-pointer"
		class:bg-amber-300={pickedCard.card?.compare(card)}
		style="top: {index * 10}vh; z-index: {index};"
		onclick={() => selectCard(card)}
	>
		<div class="relative my-8 h-min">
			<p class="absolute left-1/2 -translate-x-1/2 -translate-y-full">{card.top}</p>
			<p class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">{card.bottom}</p>
			<p class="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2">{card.left}</p>
			<p class="absolute right-0 translate-x-full top-1/2 -translate-y-1/2">{card.right}</p>
			<p class="p-2">{card.name}</p>
		</div>
	</button>
{/snippet}

<p>{owner.name}</p>
<ul class="relative w-full h-full">
	{#each cards as card, index}
		<li class="">{@render DeckCard(card, index)}</li>
	{/each}
</ul>
