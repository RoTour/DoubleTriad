import { beforeEach, describe, expect, it } from 'vitest';
import { BoardBuilder, type Board } from '../aggregates/Board';
import { GameEngineBuilder, type GameEngine } from '../aggregates/GameEngine';
import type { PlacedCard } from '../aggregates/PlacedCard';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder, type Card } from '../entities/Card';
import type { AdjacentEnemeies } from '../events/BattleStartedEvent';

describe('Unit:GameEngine', () => {
	let leftPlayerBuilder: PlayerBuilder;
	let rightPlayerBuilder: PlayerBuilder;
	let placedCard: Card;
	let board: Board;
	let engine: GameEngine;

	beforeEach(() => {
		leftPlayerBuilder = PlayerBuilder().withId('1').withName('Left player').withScore(0);
		rightPlayerBuilder = PlayerBuilder().withId('2').withName('Right player').withScore(0);
		placedCard = CardBuilder().build();
		board?.cleanUp();
		engine?.cleanUp();
	});

	// Event has been removed
	//
	// it('should send event battle:started', () => {
	// 	placedCard.right = 2;
	// 	const playerCard = CardBuilder().withRight(4).build();
	// 	leftPlayerBuilder.withCardsInHand([playerCard]);
	// 	const leftPlayer = leftPlayerBuilder.build();
	// 	const rightPlayer = rightPlayerBuilder.build();
	// 	board = BoardBuilder()
	// 		.withExistingCardPlayed(0, { card: placedCard, player: rightPlayer })
	// 		.build({ turn: leftPlayer });
	// 	const gameEngine = GameEngineBuilder().withBoard(board).build();

	// 	let detected = false;
	// 	gameEngine.onBattleStarted(() => {
	// 		detected = true;
	// 	});

	// 	leftPlayer.placeCard(playerCard, board, 1);

	// 	expect(detected).toBe(true);
	// });

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
		board = BoardBuilder()
			.withExistingCardPlayed(1, { card: cardTop, player: rightPlayer })
			.withExistingCardPlayed(3, { card: cardLeft, player: rightPlayer })
			.withExistingCardPlayed(5, { card: cardRight, player: rightPlayer })
			.withExistingCardPlayed(7, { card: cardBottom, player: rightPlayer })
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		engine = GameEngineBuilder().withBoard(board).build();

		const enemies = engine.detectAdjacentEnemies(board, leftPlayer, 4);

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
		board = BoardBuilder()
			.withExistingCardPlayed(1, { card: cardTop, player: rightPlayer })
			.withExistingCardPlayed(3, { card: cardLeft, player: rightPlayer })
			.withExistingCardPlayed(5, { card: cardRight, player: leftPlayer })
			.withExistingCardPlayed(7, { card: cardBottom, player: leftPlayer })
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		engine = GameEngineBuilder().withBoard(board).build();

		const enemies = engine.detectAdjacentEnemies(board, leftPlayer, 4);

		expect(enemies.top?.card).toBe(cardTop);
		expect(enemies.left?.card).toBe(cardLeft);
		expect(enemies.right).toBe(null);
		expect(enemies.bottom).toBe(null);
	});

	it('should detect cards won against', () => {
		const enemyCardTop = CardBuilder().withBottom(1).build();
		const playerCardCenter = CardBuilder().withTop(2).build();
		engine = GameEngineBuilder().build();
		const placedCard = { card: playerCardCenter, player: leftPlayerBuilder.build() };
		const adjacentEnemies: AdjacentEnemeies = {
			top: { card: enemyCardTop, player: rightPlayerBuilder.build() },
			left: null,
			right: null,
			bottom: null
		};

		const cardsBeaten = engine.calculateCardsBeaten(placedCard, adjacentEnemies);

		expect(cardsBeaten.length).toBe(1);
		expect(cardsBeaten[0].card).toEqual(enemyCardTop);
	});

	it('should not detect cards lose against', () => {
		const enemyCardTop = CardBuilder().withBottom(2).build();
		const playerCardCenter = CardBuilder().withTop(1).build();
		engine = GameEngineBuilder().build();
		const placedCard = { card: playerCardCenter, player: leftPlayerBuilder.build() };
		const adjacentEnemies: AdjacentEnemeies = {
			top: { card: enemyCardTop, player: rightPlayerBuilder.build() },
			left: null,
			right: null,
			bottom: null
		};

		const cardsBeaten = engine.calculateCardsBeaten(placedCard, adjacentEnemies);

		expect(cardsBeaten.length).toBe(0);
	});

	it('should switch ownership of cards won against', () => {
		const rightPlayer = rightPlayerBuilder.build();
		const leftPlayer = leftPlayerBuilder.build();
		engine = GameEngineBuilder().build();
		const cardToBeChanged: PlacedCard = { card: CardBuilder().build(), player: rightPlayer };
		const beatenEnemies: PlacedCard[] = [cardToBeChanged];

		engine.changeOwner(beatenEnemies, leftPlayer);

		expect(cardToBeChanged.player).toBe(leftPlayer);
	});

	it('should change ownership of beaten cards when card is placed', () => {
		const leftPlayerDeck = [CardBuilder().withBottom(0).build()];
		const rightPlayerDeck = [CardBuilder().withTop(1).build()];
		const leftPlayer = leftPlayerBuilder.withCardsInHand(leftPlayerDeck).build();
		const rightPlayer = rightPlayerBuilder.withCardsInHand(rightPlayerDeck).build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		engine = GameEngineBuilder().withBoard(board).build();

		/*
		# L #   	 	# L #
		# R #		=> 	# L #
		# # #   		# # #
		*/
		leftPlayer.placeCard(leftPlayerDeck[0], board, 1);
		rightPlayer.placeCard(rightPlayerDeck[0], board, 4);

		expect(engine.board.placedCards[1].player.name).toBe(rightPlayer.name);
		expect(engine.board.placedCards[4].player.name).toBe(rightPlayer.name);
	});

	it('should trigger end of game event when no more cards can be placed', () => {
		const cardsOnBoard = [
			CardBuilder().withTop(1).withRight(1).withBottom(1).withLeft(1).build(),
			CardBuilder().withTop(2).withRight(2).withBottom(2).withLeft(2).build(),
			CardBuilder().withTop(3).withRight(3).withBottom(3).withLeft(3).build(),
			CardBuilder().withTop(4).withRight(4).withBottom(4).withLeft(4).build(),
			CardBuilder().withTop(5).withRight(5).withBottom(5).withLeft(5).build(),
			CardBuilder().withTop(6).withRight(6).withBottom(6).withLeft(6).build(),
			CardBuilder().withTop(7).withRight(7).withBottom(7).withLeft(7).build(),
			CardBuilder().withTop(8).withRight(8).withBottom(8).withLeft(8).build()
		];
		const lastCard = CardBuilder().withTop(9).withRight(9).withBottom(9).withLeft(9).build();
		const leftPlayer = leftPlayerBuilder.withCardsInHand([lastCard]).build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withExistingCardPlayed(0, { card: cardsOnBoard[0], player: leftPlayer })
			.withExistingCardPlayed(1, { card: cardsOnBoard[1], player: rightPlayer })
			.withExistingCardPlayed(2, { card: cardsOnBoard[2], player: leftPlayer })
			.withExistingCardPlayed(3, { card: cardsOnBoard[3], player: rightPlayer })
			.withExistingCardPlayed(4, { card: cardsOnBoard[4], player: leftPlayer })
			.withExistingCardPlayed(5, { card: cardsOnBoard[5], player: rightPlayer })
			.withExistingCardPlayed(6, { card: cardsOnBoard[6], player: leftPlayer })
			.withExistingCardPlayed(7, { card: cardsOnBoard[7], player: rightPlayer })
			.build({ turn: leftPlayer});
		engine = GameEngineBuilder().withBoard(board).build();

		let gameEnded = false;
		engine.onGameEnded(() => {
			gameEnded = true;
		});


		leftPlayer.placeCard(lastCard, board, 8);

		expect(gameEnded).toBe(true);
	});
});
