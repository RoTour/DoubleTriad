import type { Builder } from '$lib/utils/Builder';
import type { Card } from '../entities/Card';
import { PlacingCardEvent } from '../events/PlacingCardEvent';

export type Player = {
	id: string;
	name: string;
	score: number;
	cardsInHand: Card[];
	// ----
	placeCard: (card: Card, positionIndex: number) => void;
	compare: (player: Player) => boolean;
};

const placeCard = function (this: Player, card: Card, positionIndex: number) {
	PlacingCardEvent.emit({ card, player: this, position: positionIndex });
	// board.events.cardPlaced.emit({ card, player: this, position: positionIndex });
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
		// ----
		placeCard,
		compare
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

const compare = function (this: Player, player: Player) {
	return this.id === player.id && this.name === player.name;
};
