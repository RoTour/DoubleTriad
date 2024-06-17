<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { PlacedCard } from '../../modules/game/aggregates/PlacedCard';
	import type { EndOfGameEvent } from '../../modules/game/events/EndOfGameEvent';
	import CardSlot from '../../modules/game/framework/components/CardSlot.svelte';
	import EndOfGameResults from '../../modules/game/framework/components/EndOfGameResults.svelte';
	import { GameViewModel } from './GameViewModel';

	let viewModel: GameViewModel = $state.frozen(GameViewModel());
	let displayedCards: (PlacedCard | null)[] = $derived.by(() => {
		return [
			{ ...viewModel.gameEngine.board.placedCards[0] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[1] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[2] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[3] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[4] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[5] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[6] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[7] } ?? null,
			{ ...viewModel.gameEngine.board.placedCards[8] } ?? null
		];
	});
	let results: EndOfGameEvent.Data | null = $state(null);

	$inspect('viewModel', viewModel);

	onMount(() => {
		initGame();
	});

	onDestroy(() => {
		viewModel.reset();
	});

	const syncViewModel = () => {
		viewModel = Object.assign({}, viewModel);
	};

	const initGame = () => {
		viewModel.gameEngine.board.onCardPlaced(() => {
			syncViewModel();
		});
		viewModel.gameEngine.board.onTurnChanged(() => {
			syncViewModel();
		});
		viewModel.gameEngine.onBattleEnded(() => {
			syncViewModel();
		});
		viewModel.gameEngine.onGameEnded((_results) => {
			results = _results;
		});
	};

	const localClick = (idx: number) => {
		const board = viewModel.gameEngine.board;
		const turn = board.turn;
		if (!turn || !board) return;
		const randomCard = turn.cardsInHand[Math.floor(Math.random() * turn.cardsInHand.length)];
		turn.placeCard(randomCard, board, idx);
	};

	const resetResults = () => {
		results = null;
		viewModel.reset();
		viewModel = GameViewModel();
		initGame();
	};
</script>

{#if results}
	<EndOfGameResults {results} on:continue={resetResults} />
{/if}
<main class="m-auto min-h-screen flex flex-col">
	<p>
		{viewModel.gameEngine.board.turn
			? `${viewModel.gameEngine.board.turn.name}'s turn`
			: `Please wait...`}
	</p>
	<div class="max-h-full flex-1 game-grid p-8 gap-8 [&>button]:aspect-[63/88] w-fit m-auto">
		{#each displayedCards as placedCard, idx}
			<CardSlot
				data={placedCard ?? null}
				on:click={() => localClick(idx)}
				players={[viewModel.gameEngine.board.leftPlayer, viewModel.gameEngine.board.rightPlayer]}
			/>
		{/each}
	</div>
</main>

<style lang="postcss">
	.game-grid {
		display: grid;
		grid-template-columns: repeat(3, min-content);
		grid-template-rows: repeat(3, 20vh);
		justify-items: center;
	}
</style>
