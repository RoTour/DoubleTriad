import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder, type Card } from '../entities/Card';
import { BoardBuilder } from '../entities/Board';
import { GameEngineBuilder } from '../aggregates/GameEngine';

describe('Unit:GameEngine', () => {
	let leftPlayerBuilder: PlayerBuilder;
	let rightPlayerBuilder: PlayerBuilder;
	let placedCard: Card;

	beforeEach(() => {
		leftPlayerBuilder = PlayerBuilder().withId('1').withName('Player 1').withScore(0);
		rightPlayerBuilder = PlayerBuilder().withId('2').withName('Player 2').withScore(0);
		placedCard = CardBuilder().build();
	});

	it('should send event battle:started', () => {
		placedCard.right = 2;
		const playerCard = CardBuilder().withRight(4).build();
		leftPlayerBuilder.withCardsInHand([playerCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withExistingCardPlayed(0, { card: placedCard, player: rightPlayer })
			.build({ turn: leftPlayer });
		const gameEngine = GameEngineBuilder().withBoard(board).build();

		let detected = false;
		gameEngine.onBattleStarted(() => {
			detected = true;
		});

		leftPlayer.placeCard(playerCard, board, 1);

		expect(detected).toBe(true);
	});

	/*
	# R #
	R L R
	# R #
	*/
	it('should detect adjacent enemy cards', () => {
		const cardTop = CardBuilder().withBottom(1).build();
		const cardLeft = CardBuilder().withRight(1).build();
		const cardRight = CardBuilder().withLeft(1).build();
		const cardBottom = CardBuilder().withTop(1).build();
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withExistingCardPlayed(1, { card: cardTop, player: rightPlayer })
			.withExistingCardPlayed(3, { card: cardLeft, player: rightPlayer })
			.withExistingCardPlayed(5, { card: cardRight, player: rightPlayer })
			.withExistingCardPlayed(7, { card: cardBottom, player: rightPlayer })
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		const engine = GameEngineBuilder().withBoard(board).build();

		const enemies = engine.detectAdjacentEnemies(board, leftPlayer, 4);

		console.debug(enemies);

		expect(enemies.top?.card).toBe(cardTop);
		expect(enemies.bottom?.card).toBe(cardBottom);
		expect(enemies.right?.card).toBe(cardRight);
		expect(enemies.left?.card).toBe(cardLeft);
	});

	it('should detect only adjacent enemy cards and not friendly cards', () => {
		const cardTop = CardBuilder().withBottom(1).build();
		const cardLeft = CardBuilder().withRight(1).build();
		const cardRight = CardBuilder().withLeft(1).build();
		const cardBottom = CardBuilder().withTop(1).build();
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withExistingCardPlayed(1, { card: cardTop, player: rightPlayer })
			.withExistingCardPlayed(3, { card: cardLeft, player: rightPlayer })
			.withExistingCardPlayed(5, { card: cardRight, player: leftPlayer })
			.withExistingCardPlayed(7, { card: cardBottom, player: leftPlayer })
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		const engine = GameEngineBuilder().withBoard(board).build();

		const enemies = engine.detectAdjacentEnemies(board, leftPlayer, 4);

		console.debug(enemies);

		expect(enemies.top?.card).toBe(cardTop);
		expect(enemies.left?.card).toBe(cardLeft);
		expect(enemies.right).toBe(null);
		expect(enemies.bottom).toBe(null);
	});
});
