<script lang="ts">
	import type { Player } from '../../aggregates/Player';
	import type { Card } from '../../entities/Card';
	import { pickedCard } from '../stores/PickedCardStore.svelte';
	import DeckCard from './DeckCard.svelte';

	// svelte5
	type Props = {
		cards: Card[];
		owner: Player;
	};
	let { cards, owner }: Props = $props();

	$inspect('selectedCard', pickedCard.card);
</script>

<p>{owner.name}</p>
<ul class="relative w-full h-full">
	{#each cards as card, index}
		<li class="">
			<DeckCard {card} {index} />
		</li>
	{/each}
</ul>
