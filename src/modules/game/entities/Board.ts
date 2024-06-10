import type { Builder } from '$lib/entities/Builder';
import { PlayerBuilder, type Player } from '../aggregates/Player';
import type { Card } from './Card';

export type Board = {
	leftPlayer: Player;
	rightPlayer: Player;
	cards: Card[];
}

export type BoardBuilder = Builder<Board> & {
	withLeftPlayer: (player: Player) => BoardBuilder;
	withRightPlayer: (player: Player) => BoardBuilder;
	withCard: (card: Card) => BoardBuilder;
};

export const BoardBuilder = (): BoardBuilder => {
	const board: Board = {
		leftPlayer: PlayerBuilder().build(),
		rightPlayer: PlayerBuilder().build(),
		cards: []
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
		build: function () {
			return board;
		}
	}
}