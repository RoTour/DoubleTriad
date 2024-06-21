import type { Builder } from '$lib/utils/Builder';
import type { PlacedCard } from './PlacedCard';

export type Grid = (PlacedCard | null)[];

export type GridBuilder = Builder<Grid> & {
	ofSize: (size: number) => GridBuilder;
	withCard: (index: number, card: PlacedCard) => GridBuilder;
};
export const GridBuilder = (): GridBuilder => {
	let grid: Grid = [];
	return {
		ofSize(size) {
			if (Math.sqrt(size) % 1 !== 0) throw new Error('Grid size must be a perfect square');
			for (let i = 0; i < size; i++) {
				grid.push(null);
			}
			return this;
		},
		withCard(index, card) {
			grid[index] = card;
			return this;
		},
		build() {
			grid = grid.map((cell) => cell ?? null);
			return grid;
		}
	};
};
