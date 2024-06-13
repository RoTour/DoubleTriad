<script lang="ts">
	import { onMount } from 'svelte';
	import type { Player } from '../../modules/game/aggregates/Player';
	import type { Board } from '../../modules/game/entities/Board';
	import CardSlot from '../../modules/game/framework/components/CardSlot.svelte';
	import { EngineStore } from '../../modules/game/framework/stores/EngineStore';
	import { GameViewModel } from './GameViewModel';
	import type { PlacedCard } from '../../modules/game/aggregates/PlacedCard';

	let viewModel: GameViewModel;
	let board: Board | null = null;
	let turn: Player | null = null;
	let displayedCards: (PlacedCard | null)[] = [];

	onMount(() => {
		viewModel = GameViewModel({ engine: $EngineStore });
		viewModel.gameEngine.board.onCardPlaced(({}) => {
			setDisplayCards();
      turn = viewModel?.gameEngine?.board?.turn ?? null;
		});
		setDisplayCards();
	});

	$: board = viewModel?.gameEngine?.board ?? null;
	$: viewModel?.gameEngine?.board?.turn, (turn = viewModel?.gameEngine?.board?.turn ?? null);
	$: placedCards = viewModel?.gameEngine?.board?.placedCards ?? [];

	const setDisplayCards = () => {
		displayedCards = [
			placedCards[0] ?? null,
			placedCards[1] ?? null,
			placedCards[2] ?? null,
			placedCards[3] ?? null,
			placedCards[4] ?? null,
			placedCards[5] ?? null,
			placedCards[6] ?? null,
			placedCards[7] ?? null,
			placedCards[8] ?? null
		];
	};

	const localClick = (idx: number) => {
		if (!turn || !board) return;
		const randomCard = turn.cardsInHand[Math.floor(Math.random() * turn.cardsInHand.length)];
		console.debug('Playing player:', turn);
		turn.placeCard(randomCard, board, idx);
	};
</script>

<p>{turn ? `${turn.name}'s turn` : `Please wait...`}</p>
<div class="max-w-[80%] m-auto min-h-screen game-grid p-8 gap-8">
	{#each displayedCards as placedCard, idx}
		<CardSlot
			data={placedCard ?? null}
			on:click={() => localClick(idx)}
			players={[board?.leftPlayer, board?.rightPlayer]}
		/>
	{/each}
</div>

<style lang="postcss">
	.game-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
</style>
