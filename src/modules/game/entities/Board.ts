import type { Builder } from '$lib/entities/Builder';
import { EventManager } from '$lib/entities/EventManager';
import { PlayerBuilder, type Player } from '../aggregates/Player';
import type { Card } from './Card';

export type Board = {
	leftPlayer: Player;
	rightPlayer: Player;
	cards: Card[];
	turn: Player;
	events: {
		cardPlaced: EventManager<Card>;
	};
	onCardPlaced: (fn: (card: Card) => void) => void;
}

export type BoardBuilder = Builder<Board> & {
	withLeftPlayer: (player: Player) => BoardBuilder;
	withRightPlayer: (player: Player) => BoardBuilder;
	withCard: (card: Card) => BoardBuilder;
};

export const BoardBuilder = (): BoardBuilder => {
	const _leftPlayer = PlayerBuilder().build();
	const _rightPlayer = PlayerBuilder().build();
	const board: Board = {
		leftPlayer: _leftPlayer,
		rightPlayer: _rightPlayer,
		cards: [],
		turn: _leftPlayer,
		events: {
			cardPlaced: EventManager<Card>()
		},
		onCardPlaced: (fn) => {
			board.events.cardPlaced.subscribe(fn)
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
		withCard: function (card: Card) {
			board.cards.push(card);
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