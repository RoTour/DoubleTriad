import { afterEach, describe, expect, it } from 'vitest';
import { BoardBuilder, type Board } from '../aggregates/Board';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder, type Card } from '../entities/Card';

describe('GameEngine', () => {
	const leftPlayerBuilder = PlayerBuilder().withId('1').withName('Player Left').withScore(0);
	const rightPlayerBuilder = PlayerBuilder().withId('2').withName('Player Right').withScore(0);
	const defaultCard = CardBuilder().build();
	let board: Board;
	afterEach(() => {
		board?.cleanUp();
	});

	it('should add a card to the board', () => {
		leftPlayerBuilder.withCardsInHand([defaultCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(defaultCard, 0);

		expect(board.placedCards.map((it) => it.card)).toContain(defaultCard);
	});

	it('should place the card in the correct position', () => {
		const placedCard = CardBuilder().build();
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, 2);

		expect(board.placedCards.at(2)?.card).toBe(placedCard);
		expect(board.placedCards.at(0)?.card).not.toBe(placedCard);
		expect(board.placedCards.at(1)?.card).not.toBe(placedCard);
	});

	it('error should be thrown if player tries placing a card he doesnt have in his hand', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		const placeCard = () => leftPlayer.placeCard(defaultCard, 0);

		expect(placeCard).toThrowError('Player does not own the card');
	});

	it('should throw an error if the position index is out of bounds', () => {
		leftPlayerBuilder.withCardsInHand([defaultCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		const placeCard = () => leftPlayer.placeCard(defaultCard, 10);
		const placeCardNegative = () => leftPlayer.placeCard(defaultCard, -5);

		expect(placeCard).toThrowError('Position is out of bounds');
		expect(placeCardNegative).toThrowError('Position is out of bounds');
	});

	it('should throw and error if a card has already been placed in the position', () => {
		const cardToPlace = CardBuilder().build();
		rightPlayerBuilder.withCardsInHand([cardToPlace]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.withExistingCardPlayed(0, { card: defaultCard, player: leftPlayer })
			.build({ turn: rightPlayer });

		const secondPlayerTurn = () => rightPlayer.placeCard(cardToPlace, 0);

		expect(secondPlayerTurn).toThrowError('Position is already occupied');
	});

	it('should emit event when a card is placed', () => {
		leftPlayerBuilder.withCardsInHand([defaultCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detected = false;
		board.onCardPlaced(() => {
			detected = true;
		});

		leftPlayer.placeCard(defaultCard, 0);

		expect(detected).toBe(true);
	});

	it('emitted event should transfer card data', () => {
		leftPlayerBuilder.withCardsInHand([defaultCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detectedCard = null;
		board.onCardPlaced(({ card }) => {
			detectedCard = card;
		});

		leftPlayer.placeCard(defaultCard, 0);

		expect(detectedCard).toBe(defaultCard);
	});

	it('emitted event should transfer card position', () => {
		leftPlayerBuilder.withCardsInHand([defaultCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detectedPosition = null;
		board.onCardPlaced(({ position }) => {
			detectedPosition = position;
		});

		leftPlayer.placeCard(defaultCard, 0);

		expect(detectedPosition).toBe(0);
	});

	it('should remove card from player hand after placing it on the board', () => {
		const leftPlayerDeck: Card[] = [
			CardBuilder().withTop(1).build(),
			CardBuilder().withBottom(2).build()
		];
		const rightPlayerDeck: Card[] = [CardBuilder().withLeft(1).build()];
		const leftPlayer = leftPlayerBuilder.withCardsInHand(leftPlayerDeck).build();
		const rightPlayer = rightPlayerBuilder.withCardsInHand(rightPlayerDeck).build();
		board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(leftPlayerDeck[0], 0);
		rightPlayer.placeCard(rightPlayerDeck[0], 1);
		const attemptToPlaceCardTwice = () => leftPlayer.placeCard(leftPlayerDeck[0], 2);

		expect(attemptToPlaceCardTwice).toThrowError('Player does not own the card');
	});
});
