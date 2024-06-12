import type { Builder } from '$lib/entities/Builder';
import type { Board } from '../entities/Board';
import type { Card } from '../entities/Card';

export type Player = {
	id: string;
	name: string;
	score: number;
	cardsInHand: Card[];
	placeCard: (card: Card, board: Board, positionIndex: number) => void;
};

const placeCard = function (this: Player, card: Card, board: Board, positionIndex: number) {
	const isPlayerTurn = board.turn === this;
	if (!isPlayerTurn) {
		throw new Error('It is not your turn');
	}

	const cardExists = this.cardsInHand.some((c) => c === card);
	if (!cardExists) {
		throw new Error('Player does not own the card');
	}

	const isPositionIndexOutOfBounds = positionIndex < 0 || positionIndex >= 10;
	if (isPositionIndexOutOfBounds) {
		throw new Error('Position is out of bounds');
	}

	const isPositionEmpty = board.placedCards[positionIndex] === undefined;
	if (!isPositionEmpty) {
		throw new Error('Position is already occupied');
	}

	this.cardsInHand = this.cardsInHand.filter((c) => c !== card);
	board.placedCards[positionIndex] = { card: card, player: this };
	board.events.cardPlaced.emit({ card, player: this, position: positionIndex });
};

export type PlayerBuilder = Builder<Player> & {
	withId: (id: string) => PlayerBuilder;
	withName: (name: string) => PlayerBuilder;
	withScore: (score: number) => PlayerBuilder;
	withCardsInHand: (cardsInHand: Card[]) => PlayerBuilder;
};

export const PlayerBuilder = (): PlayerBuilder => {
	const player: Player = {
		id: '',
		name: '',
		score: 0,
		cardsInHand: [],
		placeCard
	};

	return {
		withId: function (id: string) {
			player.id = id;
			return this;
		},
		withName: function (name: string) {
			player.name = name;
			return this;
		},
		withScore: function (score: number) {
			player.score = score;
			return this;
		},
		withCardsInHand: function (cardsInHand: Card[]) {
			player.cardsInHand = cardsInHand;
			return this;
		},
		build: function () {
			return player;
		}
	};
};
