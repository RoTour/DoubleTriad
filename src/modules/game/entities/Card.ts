import type { Builder } from '$lib/entities/Builder';

export type Card = {
	name: string;
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export type CardBuilder = Builder<Card> & {
	withLeft: (left: number) => CardBuilder;
	withTop: (top: number) => CardBuilder;
	withRight: (right: number) => CardBuilder;
	withBottom: (bottom: number) => CardBuilder;
	withName: (name: string) => CardBuilder;
};

export const CardBuilder = (): CardBuilder => {
	const card: Card = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		name: 'Basic Card'
	};

	return {
		withLeft: function (left: number) {
			card.left = left;
			return this;
		},
		withTop: function (top: number) {
			card.top = top;
			return this;
		},
		withRight: function (right: number) {
			card.right = right;
			return this;
		},
		withBottom: function (bottom: number) {
			card.bottom = bottom;
			return this;
		},
		withName: function (name: string) {
			card.name = name;
			return this;
		},
		build: function () {
			return card;
		}
	}
}