import { describe, expect, it } from 'vitest';
import { GridBuilder, type Grid } from '../aggregates/Grid';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder } from '../entities/Card';
import { CommonStrategy } from '../repositories/CommonStrategy';
import { OffensiveStrategy } from '../repositories/OffensiveStrategy';

describe('Unit:CommonStrategy', () => {
	it('should find empty slots', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().build(), player: enemyPlayer })
			.withCard(4, { card: CardBuilder().build(), player: enemyPlayer })
			.build();

		const emptySlots = CommonStrategy.findEmptyPositions(grid);

		expect(emptySlots).toEqual([1, 2, 3, 5, 6, 7, 8]);
	});
});

describe('Unit:OffensiveStrategy', () => {
	it('should find enemy cards with neighbourg slot available', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const player = PlayerBuilder().withName('Player').build();

		/**
		 * E P P
		 * # # #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().build(), player: enemyPlayer })
			.withCard(1, { card: CardBuilder().build(), player: player })
			.withCard(2, { card: CardBuilder().build(), player: player })
			.build();

		const emptySlots = CommonStrategy.findAvailableSlotsWithNeighbourEnemy(grid, player);

		expect(emptySlots).toEqual([3]);
	});

	it('should not duplicate empty slots', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const player = PlayerBuilder().withName('Player').build();

		/**
		 * E P P
		 * # E #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().build(), player: enemyPlayer })
			.withCard(1, { card: CardBuilder().build(), player: player })
			.withCard(2, { card: CardBuilder().build(), player: player })
			.withCard(4, { card: CardBuilder().build(), player: enemyPlayer })
			.build();

		const emptySlots = CommonStrategy.findAvailableSlotsWithNeighbourEnemy(grid, player);

		expect(emptySlots).toEqual([3, 5, 7]);
	});

	it('should not find empty slots if no enemy neighbour', () => {
		const player = PlayerBuilder().withName('Player').build();
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();

		/**
		 * P E P
		 * # P #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().build(), player: player })
			.withCard(1, { card: CardBuilder().build(), player: enemyPlayer })
			.withCard(2, { card: CardBuilder().build(), player: player })
			.withCard(4, { card: CardBuilder().build(), player: player })
			.build();

		const emptySlots = CommonStrategy.findAvailableSlotsWithNeighbourEnemy(grid, player);

		expect(emptySlots).toEqual([]);
	});

	// Score calculation is : SUM(EnemyPower - PlayerPower + KillBonus)
	it('should define a score base on neighbour power', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		/**
		 * # # #
		 * P E #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(4, { card: CardBuilder().withAll(1, 2, 3, 4).build(), player: enemyPlayer })
			.build();

		const card = CardBuilder().withAll(3, 3, 3, 3).build();
		const result = OffensiveStrategy.getScoreForPlacement(grid, card, 3);

		expect(result.score).toEqual(4);
	});

	it('score should include multiple neighbours', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		/**
		 * P E #
		 * E # #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(1, { card: CardBuilder().withAll(1, 2, 3, 4).build(), player: enemyPlayer })
			.withCard(3, { card: CardBuilder().withAll(1, 2, 3, 4).build(), player: enemyPlayer })
			.build();

		const card = CardBuilder().withAll(3, 3, 3, 3).build();
		const result = OffensiveStrategy.getScoreForPlacement(grid, card, 0);

		// (2 - 3 + 5) + (1 - 3 + 5) = 7
		expect(result.score).toEqual(7);
	});

	it('should choose the best placement', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const player = PlayerBuilder().withName('Player').build();

		/**
		 * E P P
		 * # E #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().withAll(1, 2, 3, 4).build(), player: enemyPlayer })
			.withCard(1, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(2, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(4, { card: CardBuilder().withAll(1, 2, 3, 4).build(), player: enemyPlayer })
			.build();
		const card = CardBuilder().withAll(5, 5, 5, 5).build();
		const positions = [3, 5, 7];
		const evaluatedPositions = positions.map((position) =>
			OffensiveStrategy.getScoreForPlacement(grid, card, position)
		);
		const bestPosition = CommonStrategy.selectPlacement(evaluatedPositions);

		expect(bestPosition.position).toEqual(3);
	});

	it('should select the best card to place', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const player = PlayerBuilder()
			.withName('Player')
			.withCardsInHand([
				CardBuilder().withAll(10, 10, 10, 10).build(),
				CardBuilder().withAll(5, 5, 5, 5).build()
			])
			.build();

		/**
		 * E P P
		 * # E #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().withAll(2, 2, 2, 2).build(), player: enemyPlayer })
			.withCard(1, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(2, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(4, { card: CardBuilder().withAll(4, 4, 4, 4).build(), player: enemyPlayer })
			.build();

		const bestMoveByCard = OffensiveStrategy.bestOffensiveMoveByCard(
			grid,
			player.cardsInHand,
			player
		);
		const bestMove = OffensiveStrategy.chooseBestCard(bestMoveByCard);

		expect(bestMove.card).toBe(player.cardsInHand[1]);
	});

	it('should compute next best move', () => {
		const enemyPlayer = PlayerBuilder().withName('Enemy').build();
		const player = PlayerBuilder()
			.withName('Player')
			.withCardsInHand([
				CardBuilder().withAll(10, 10, 10, 10).build(),
				CardBuilder().withAll(5, 5, 5, 5).build()
			])
			.build();

		/**
		 * E P P
		 * # E #
		 * # # #
		 */
		const grid: Grid = GridBuilder()
			.ofSize(9)
			.withCard(0, { card: CardBuilder().withAll(2, 2, 2, 2).build(), player: enemyPlayer })
			.withCard(1, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(2, { card: CardBuilder().withAll(0, 0, 0, 0).build(), player: player })
			.withCard(4, { card: CardBuilder().withAll(4, 4, 4, 4).build(), player: enemyPlayer })
			.build();

		const bestMove = OffensiveStrategy.Strategy().computeMove(grid, player);

		expect(bestMove.card).toBe(player.cardsInHand[1]);
	});
});
