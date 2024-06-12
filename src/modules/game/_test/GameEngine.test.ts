import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder, type Card } from '../entities/Card';
import { BoardBuilder } from '../entities/Board';
import { GameEngineBuilder } from '../aggregates/GameEngine';
import type { AdjacentEnemeies } from '../events/BattleStartedEvent';
import type { PlacedCard } from '../aggregates/PlacedCard';

describe('Unit:GameEngine', () => {
	let leftPlayerBuilder: PlayerBuilder;
	let rightPlayerBuilder: PlayerBuilder;
	let placedCard: Card;

	beforeEach(() => {
		leftPlayerBuilder = PlayerBuilder().withId('1').withName('Left player').withScore(0);
		rightPlayerBuilder = PlayerBuilder().withId('2').withName('Right player').withScore(0);
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

		expect(enemies.top?.card).toBe(cardTop);
		expect(enemies.left?.card).toBe(cardLeft);
		expect(enemies.right).toBe(null);
		expect(enemies.bottom).toBe(null);
	});

	it('should detect cards won against', () => {
		const enemyCardTop = CardBuilder().withBottom(1).build();
		const playerCardCenter = CardBuilder().withTop(2).build();
		const engine = GameEngineBuilder().build();
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
		const engine = GameEngineBuilder().build();
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
		const engine = GameEngineBuilder().build();
		const cardToBeChanged: PlacedCard = {card: CardBuilder().build(), player: rightPlayer};
		const beatenEnemies: PlacedCard[] = [cardToBeChanged];

		engine.changeOwner(beatenEnemies, leftPlayer);

		expect(cardToBeChanged.player).toBe(leftPlayer);
	});

	it('should change ownership of beaten cards when card is placed', () => {
		const leftPlayerDeck = [
			CardBuilder().withBottom(0).build(),
		];
		const rightPlayerDeck = [
			CardBuilder().withTop(1).build(),
		];
		const leftPlayer = leftPlayerBuilder.withCardsInHand(leftPlayerDeck).build();
		const rightPlayer = rightPlayerBuilder.withCardsInHand(rightPlayerDeck).build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });
		const engine = GameEngineBuilder().withBoard(board).build();

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
});
