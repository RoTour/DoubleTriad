import type { Grid } from '../aggregates/Grid';
import type { Player } from '../aggregates/Player';
import type { Card } from '../entities/Card';
import type { IPlayerStrategy, NextMove } from '../interfaces/IPlayerStrategy';
import { CommonStrategy } from './CommonStrategy';

// export const OffensiveStrategy = (): IPlayerStrategy => {
// 	return {
// 		computeMove: (grid, cardsAvailable): NextMove => {
// 			cardsAvailable.map((card) => bestOffensiveMove(grid, card));

// 			return { card: cardsAvailable[0], position: 0 };
// 		}
// 	}
// };

export namespace OffensiveStrategy {
	export const getScoreForPlacement = (
		grid: Grid,
		card: Card,
		destination: number
	): CommonStrategy.EvaluatedPosition => {
		const neighboursPosition = CommonStrategy.getNeighbours(destination, Math.sqrt(grid.length));
		const scoreByNeighbourg = neighboursPosition.map((neighborPosition) => {
			const power = getNeighbourPowerDiff(grid, card, destination, neighborPosition);
			return power;
		});
		return {
			score: scoreByNeighbourg.reduce((acc, power) => acc + power, 0),
			position: destination
		};
	};

	const getNeighbourPowerDiff = (
		grid: Grid,
		card: Card,
		targetPosition: number,
		enemyPosition: number,
		killBonus = 5
	): number => {
		const enemy = grid[enemyPosition];
		console.debug({ enemy, pos: enemyPosition });
		if (!enemy) return 0;
		if (enemyPosition === targetPosition - 1) {
			return enemy.card.right - card.left < 0
				? enemy.card.right - card.left + killBonus
				: enemy.card.right - card.left;
		}
		if (enemyPosition === targetPosition + 1) {
			return enemy.card.left - card.right < 0
				? enemy.card.left - card.right + killBonus
				: enemy.card.left - card.right;
		}
		if (enemyPosition === targetPosition - Math.sqrt(grid.length)) {
			return enemy.card.bottom - card.top < 0
				? enemy.card.bottom - card.top + killBonus
				: enemy.card.bottom - card.top;
		}
		if (enemyPosition === targetPosition + Math.sqrt(grid.length)) {
			return enemy.card.top - card.bottom < 0
				? enemy.card.top - card.bottom + killBonus
				: enemy.card.top - card.bottom;
		}
		return 0;
	};

	export const bestOffensiveMoveByCard = (
		grid: Grid,
		cards: Card[],
		player: Player
	): (CommonStrategy.EvaluatedPosition & { card: Card })[] => {
		const emptySlots = CommonStrategy.findAvailableSlotsWithNeighbourEnemy(grid, player);
		return cards.map((card) => {
			const evaluatedPositions = emptySlots.map((position) =>
				OffensiveStrategy.getScoreForPlacement(grid, card, position)
			);
			const bestPosition = CommonStrategy.selectPlacement(evaluatedPositions);
			return { ...bestPosition, card };
		});
	};

	export const chooseBestCard = (
		possibleMoves: (CommonStrategy.EvaluatedPosition & { card: Card })[]
	): CommonStrategy.EvaluatedPosition & { card: Card } => {
		return possibleMoves.reduce((acc, move) => (move.score > acc.score ? move : acc));
	};

	export const Strategy = (): IPlayerStrategy => {
		return {
			computeMove: (grid, player): NextMove => {
				const bestMoveByCard = OffensiveStrategy.bestOffensiveMoveByCard(
					grid,
					player.cardsInHand,
					player
				);
				const bestMove = OffensiveStrategy.chooseBestCard(bestMoveByCard);

				return bestMove;
			}
		};
	};
}

// export const bestOffensiveMove = (grid: Grid, card: Card): { card: Card, score: number } => {};
