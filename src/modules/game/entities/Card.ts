import type { Builder } from '$lib/utils/Builder';
import { IdGenerator } from '$lib/utils/IdGenerator';

export type Card = {
	name: string;
	id: string;
	left: number;
	top: number;
	right: number;
	bottom: number;
	// ----
	compare: (other: Card) => boolean;
};

export type CardBuilder = Builder<Card> & {
	withLeft: (left: number) => CardBuilder;
	withTop: (top: number) => CardBuilder;
	withRight: (right: number) => CardBuilder;
	withBottom: (bottom: number) => CardBuilder;
	withAll: (top: number, left: number, right: number, bottom: number) => CardBuilder;
	withName: (name: string) => CardBuilder;
};

export const CardBuilder = (): CardBuilder => {
	const card: Card = {
		name: 'Basic Card',
		id: IdGenerator.shortString(),
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		// ----
		compare: compare
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
		withAll: function (top: number, left: number, right: number, bottom: number) {
			card.top = top;
			card.left = left;
			card.right = right;
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
	};
};

function compare(this: Card, other: Card): boolean {
	return this.id === other.id;
}
