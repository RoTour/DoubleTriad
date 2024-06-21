import type { Grid } from '../aggregates/Grid';
import type { Player } from '../aggregates/Player';

export namespace CommonStrategy {
	export const findEmptyPositions = (grid: Grid): number[] => {
		const emptyPositions: number[] = [];
		grid.forEach((cell, index) => {
			if (!cell) emptyPositions.push(index);
		});
		return emptyPositions;
	};

	export const findAvailableSlotsWithNeighbourEnemy = (grid: Grid, self: Player): number[] => {
		const emptySlots: number[] = [];
		grid.forEach((cell, index) => {
			if (!cell && hasNeighbourEnemy(grid, index, self)) {
				emptySlots.push(index);
			}
		});
		return emptySlots;
	};

	export const hasNeighbourEnemy = (grid: Grid, index: number, self: Player): boolean => {
		const neighbours = getNeighbours(index, Math.sqrt(grid.length));
		return neighbours.some((neighbour) => {
			const cell = grid[neighbour];
			return cell && cell.player !== self;
		});
	};

	export const getNeighbours = (index: number, gridSize: number): number[] => {
		const neighbours: number[] = [];
		const row = Math.floor(index / gridSize);
		const col = index % gridSize;
		const top = row - 1;
		const bottom = row + 1;
		const left = col - 1;
		const right = col + 1;

		if (top >= 0) neighbours.push(top * gridSize + col);
		if (bottom < gridSize) neighbours.push(bottom * gridSize + col);
		if (left >= 0) neighbours.push(row * gridSize + left);
		if (right < gridSize) neighbours.push(row * gridSize + right);

		return neighbours;
	};

	export type EvaluatedPosition = {
		position: number;
		score: number;
	};

	export const selectPlacement = (positions: EvaluatedPosition[]): EvaluatedPosition => {
		return positions.reduce((acc, position) => (position.score > acc.score ? position : acc));
	};
}
