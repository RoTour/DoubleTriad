import { describe, expect, it } from 'vitest';
import { BoardBuilder } from '../aggregates/Board';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder, type Card } from '../entities/Card';

describe('GameEngine', () => {
	const leftPlayerBuilder = PlayerBuilder().withId('1').withName('Player 1').withScore(0);
	const rightPlayerBuilder = PlayerBuilder().withId('2').withName('Player 2').withScore(0);
	const placedCard = CardBuilder().build();

	it('should add a card to the board', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 0);

		expect(board.placedCards.map((it) => it.card)).toContain(placedCard);
	});

	it('should place the card in the correct position', () => {
		const placedCard = CardBuilder().build();
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 2);

		expect(board.placedCards.at(2)?.card).toBe(placedCard);
		expect(board.placedCards.at(0)?.card).not.toBe(placedCard);
		expect(board.placedCards.at(1)?.card).not.toBe(placedCard);
	});

	it('error should be thrown if player tries placing a card he doesnt have in his hand', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		const placeCard = () => leftPlayer.placeCard(placedCard, board, 0);

		expect(placeCard).toThrowError('Player does not own the card');
	});

	it('should throw an error if the position index is out of bounds', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		const placeCard = () => leftPlayer.placeCard(placedCard, board, 10);
		const placeCardNegative = () => leftPlayer.placeCard(placedCard, board, -5);

		expect(placeCard).toThrowError('Position is out of bounds');
		expect(placeCardNegative).toThrowError('Position is out of bounds');
	});

	it('should throw and error if a card has already been placed in the position', () => {
		const placedCard2 = CardBuilder().build();
		leftPlayerBuilder.withCardsInHand([placedCard]);
		rightPlayerBuilder.withCardsInHand([placedCard2]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 0);
		const secondPlayerTurn = () => rightPlayer.placeCard(placedCard2, board, 0);

		expect(secondPlayerTurn).toThrowError('Position is already occupied');
	});

	it('should emit event when a card is placed', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detected = false;
		board.onCardPlaced(() => {
			detected = true;
		});

		leftPlayer.placeCard(placedCard, board, 0);

		expect(detected).toBe(true);
	});

	it('emitted event should transfer card data', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detectedCard = null;
		board.onCardPlaced(({ card }) => {
			detectedCard = card;
		});

		leftPlayer.placeCard(placedCard, board, 0);

		expect(detectedCard).toBe(placedCard);
	});

	it('emitted event should transfer card position', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });
		let detectedPosition = null;
		board.onCardPlaced(({ position }) => {
			detectedPosition = position;
		});

		leftPlayer.placeCard(placedCard, board, 0);

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
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(leftPlayerDeck[0], board, 0);
		rightPlayer.placeCard(rightPlayerDeck[0], board, 1);
		const attemptToPlaceCardTwice = () => leftPlayer.placeCard(leftPlayerDeck[0], board, 2);

		expect(attemptToPlaceCardTwice).toThrowError('Player does not own the card');
	});
});
