<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { PlacedCard } from '../../modules/game/aggregates/PlacedCard';
	import type { EndOfGameEvent } from '../../modules/game/events/EndOfGameEvent';
	import CardSlot from '../../modules/game/framework/components/CardSlot.svelte';
	import Deck from '../../modules/game/framework/components/Deck.svelte';
	import EndOfGameResults from '../../modules/game/framework/components/EndOfGameResults.svelte';
	import { GameViewModel } from './GameViewModel';
	import { pickedCard } from '../../modules/game/framework/stores/PickedCardStore.svelte';
	import { NotificationBuilder } from '$lib/entities/Notification';
	import { currentPlayerStore } from '../../modules/game/framework/stores/CurrentPlayerStore.svelte';

	let viewModel: GameViewModel = $state.frozen(GameViewModel());
	let displayedCards: (PlacedCard | null)[] = $derived.by(() => {
		const result: (PlacedCard | null)[] = [];
		for (let i = 0; i < 9; i++) {
			const card = viewModel.gameEngine.board.placedCards.at(i);
			if (card) {
				result.push({ ...card });
			} else {
				result.push(null);
			}
		}
		return result;
	});
	let results: EndOfGameEvent.Data | null = $state(null);

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
			pickedCard.set(null);
		});
		viewModel.gameEngine.board.onTurnChanged(({ player }) => {
			syncViewModel();
			currentPlayerStore.value = player;
		});
		viewModel.gameEngine.onBattleEnded(() => {
			syncViewModel();
		});
		viewModel.gameEngine.onGameEnded((_results) => {
			results = _results;
		});
		currentPlayerStore.value = viewModel.gameEngine.board.turn;
	};

	$inspect('turn', currentPlayerStore.value?.name);

	const localClick = (idx: number) => {
		const board = viewModel.gameEngine.board;
		const turn = board.turn;
		const cardToBePlaced = pickedCard.card;
		if (!turn || !board || !cardToBePlaced) return;
		try {
			turn.placeCard(cardToBePlaced, board, idx);
		} catch (e) {
			pickedCard.set(null);
			if (e instanceof Error) {
				NotificationBuilder()
					.withType('error')
					.withTitle('Error : ')
					.withDescription(e.message)
					.withExpiration(3000)
					.send();
				return;
			}
			alert('An error occurred, please try again later');
		}
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
<main class="m-auto h-screen max-h-screen flex flex-col">
	<p>
		{viewModel.gameEngine.board.turn
			? `${viewModel.gameEngine.board.turn.name}'s turn`
			: `Please wait...`}
	</p>
	<div class="flex justify-center flex-1 min-h-0">
		<aside class="hidden lg:block py-8 flex-1 text-end">
			<Deck
				owner={viewModel.gameEngine.board.leftPlayer}
				cards={viewModel.gameEngine.board.leftPlayer.cardsInHand}
			/>
		</aside>
		<div class="max-h-full game-grid p-4 lg:p-8 gap-4 lg:gap-8 [&>button]:aspect-[63/88] w-fit">
			{#each displayedCards as placedCard, idx}
				<CardSlot
					data={placedCard ?? null}
					on:click={() => localClick(idx)}
					players={[viewModel.gameEngine.board.leftPlayer, viewModel.gameEngine.board.rightPlayer]}
				/>
			{/each}
		</div>
		<aside class="hidden lg:block py-8 flex-1">
			<Deck
				owner={viewModel.gameEngine.board.rightPlayer}
				cards={viewModel.gameEngine.board.rightPlayer.cardsInHand}
			/>
		</aside>
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
