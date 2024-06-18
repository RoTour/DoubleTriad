<script lang="ts">
	import type { Card } from '../../entities/Card';
	import { pickedCard } from '../stores/PickedCardStore.svelte';

	type Props = {
		card: Card;
		index: number;
		disabled: boolean;
	};
	let { card, index, disabled }: Props = $props();
	let selected = $derived.by(() => pickedCard.card?.compare(card) ?? false);

	const selectCard = (card: Card) => {
		if (pickedCard.card?.compare(card)) {
			pickedCard.set(null);
			return;
		}
		pickedCard.set(card);
	};
</script>

<button
	class="aspect-[63/88] border-2 border-black h-[20vh] flex justify-center
absolute left-1/2 -translate-x-1/2 hover:scale-110 cursor-pointer"
	class:bg-amber-300={selected}
	class:bg-white={!selected && !disabled}
	class:bg-gray-300={disabled}
	class:opacity-50={disabled}
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
