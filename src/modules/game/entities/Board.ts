import type { Builder } from '$lib/entities/Builder';
import { EventManager } from '$lib/entities/EventManager';
import type { PlacedCard } from '../aggregates/PlacedCard';
import { PlayerBuilder, type Player } from '../aggregates/Player';
import { CardPlacedEvent } from '../events/CardPlacedEvent';

export type Board = {
	leftPlayer: Player;
	rightPlayer: Player;
	placedCards: PlacedCard[];
	turn: Player;
	events: {
		cardPlaced: CardPlacedEvent.Manager;
	};
	onCardPlaced: (fn: (data: CardPlacedEvent.Data) => void) => void;
	cleanUp: () => void;
}

export type BoardBuilder = Builder<Board> & {
	withLeftPlayer: (player: Player) => BoardBuilder;
	withRightPlayer: (player: Player) => BoardBuilder;
	withPlayedCards: (cards: PlacedCard[]) => BoardBuilder;
	withExistingCardPlayed: (index: number, card: PlacedCard) => BoardBuilder;
};

export const BoardBuilder = (): BoardBuilder => {
	const _leftPlayer = PlayerBuilder().build();
	const _rightPlayer = PlayerBuilder().build();
	const board: Board = {
		leftPlayer: _leftPlayer,
		rightPlayer: _rightPlayer,
		placedCards: [],
		turn: _leftPlayer,
		events: {
			cardPlaced: CardPlacedEvent.Manager,
		},
		onCardPlaced: (fn) => {
			board.events.cardPlaced.subscribe(fn)
		},
		cleanUp: () => {
			board.events.cardPlaced.unsubscribeAll();
		}
	};

	return {
		withLeftPlayer: function (player: Player) {
			board.leftPlayer = player;
			return this;
		},
		withRightPlayer: function (player: Player) {
			board.rightPlayer = player;
			return this;
		},
		withPlayedCards: function (cards: PlacedCard[]) {
			board.placedCards = cards;
			return this;
		},
		withExistingCardPlayed: function (index: number, card: PlacedCard) {
			board.placedCards[index] = card;
			return this;
		},
		build: function (init?: { turn: Player }) {
			// Randomly choose who goes first if not specified
			const firstPlayerToPlay = init?.turn || (Math.random() < 0.5 ? board.leftPlayer : board.rightPlayer);
			board.turn = firstPlayerToPlay;

			// Switch turns after a card is placed
			board.events.cardPlaced.subscribe(() => {
				board.turn = board.turn === board.leftPlayer ? board.rightPlayer : board.leftPlayer;
			});

			return board;
		}
	}
}