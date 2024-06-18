<script lang="ts">
	import type { Player } from '../../aggregates/Player';
	import type { Card } from '../../entities/Card';
	import { currentPlayerStore } from '../stores/CurrentPlayerStore.svelte';
	import DeckCard from './DeckCard.svelte';

	type Props = {
		cards: Card[];
		owner: Player;
	};
	let { cards, owner }: Props = $props();

	let disabled: boolean = $derived(
		currentPlayerStore.value ? !owner.compare(currentPlayerStore.value) : true
	);
</script>

<p>{owner.name}</p>
<ul
	class="relative w-full h-full"
	class:pointer-events-none={disabled}
	class:select-none={disabled}
>
	{#each cards as card, index}
		<li class="">
			<DeckCard {card} {index} {disabled} />
		</li>
	{/each}
</ul>
