import type { Builder } from '$lib/entities/Builder';

export type Card = {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export type CardBuilder = Builder<Card> & {
	withLeft: (left: number) => Card;
	withTop: (top: number) => Card
	withRight: (right: number) => Card
	withBottom: (bottom: number) => Card
};

export const CardBuilder = (): CardBuilder => {
	const card: Card = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0
	};

	return {
		withLeft: function (left: number) {
			card.left = left;
			return card;
		},
		withTop: function (top: number) {
			card.top = top;
			return card;
		},
		withRight: function (right: number) {
			card.right = right;
			return card;
		},
		withBottom: function (bottom: number) {
			card.bottom = bottom;
			return card;
		},
		build: function () {
			return card;
		}
	}
}