<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlacedCard } from '../../modules/game/aggregates/PlacedCard';
	import { type Player } from '../../modules/game/aggregates/Player';
	import type { Board } from '../../modules/game/entities/Board';
	import type { EndOfGameEvent } from '../../modules/game/events/EndOfGameEvent';
	import CardSlot from '../../modules/game/framework/components/CardSlot.svelte';
	import EndOfGameResults from '../../modules/game/framework/components/EndOfGameResults.svelte';
	import { EngineStore } from '../../modules/game/framework/stores/EngineStore';
	import { GameViewModel } from './GameViewModel';

	let viewModel: GameViewModel;
	let board: Board | null = null;
	let turn: Player | null = null;
	let displayedCards: (PlacedCard | null)[] = [];
	let results: EndOfGameEvent.Data | null = null;

	onMount(() => {
		viewModel = GameViewModel({ engine: $EngineStore });
		initGame();
	});

	const initGame = () => {
		viewModel.gameEngine.board.onCardPlaced(({}) => {
			setDisplayCards();
			turn = viewModel?.gameEngine?.board?.turn ?? null;
		});
		viewModel.gameEngine.onGameEnded((_results) => {
			console.debug('Game ended', _results);
			results = _results;
		});
		board = viewModel?.gameEngine?.board ?? null;
		turn = viewModel?.gameEngine?.board?.turn ?? null;
		placedCards = viewModel?.gameEngine?.board?.placedCards ?? [];
		setDisplayCards();
	};

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
		turn.placeCard(randomCard, board, idx);
	};

	const resetResults = () => {
		results = null;
		viewModel.reset();
		initGame();
		console.debug('viewModel', viewModel);
	};

	$: board = viewModel?.gameEngine?.board ?? null;
	$: turn = viewModel?.gameEngine?.board?.turn ?? null;
	$: placedCards = viewModel?.gameEngine?.board?.placedCards ?? [];
	$: console.debug('viewModel Changed', viewModel);
	$: console.debug('board Changed', board);
</script>

{#if results}
	<EndOfGameResults {results} on:continue={resetResults} />
{/if}
{#if board}
	<main class="max-w-[80%] m-auto min-h-screen flex flex-col">
		<p>{turn ? `${turn.name}'s turn` : `Please wait...`}</p>
		<div class="flex-1 game-grid p-8 gap-8">
			{#each displayedCards as placedCard, idx}
				<CardSlot
					data={placedCard ?? null}
					on:click={() => localClick(idx)}
					players={[board?.leftPlayer, board?.rightPlayer]}
				/>
			{/each}
		</div>
	</main>
{/if}

<style lang="postcss">
	.game-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
</style>
