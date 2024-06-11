import { describe, it, expect } from 'vitest';
import { PlayerBuilder } from '../aggregates/Player';
import { BoardBuilder } from '../entities/Board';
import { CardBuilder } from '../entities/Card';

describe('GameEngine', () => {
	const leftPlayerBuilder = PlayerBuilder().withId('1').withName('Player 1').withScore(0);
	const rightPlayerBuilder = PlayerBuilder().withId('2').withName('Player 2').withScore(0);
	const placedCard = CardBuilder().build();

	it('should add a card to the board', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 0);

		expect(board.cards).toContain(placedCard);
	});

	it('should place the card in the correct position', () => {
		const placedCard = CardBuilder().build();
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 2);

		expect(board.cards.at(2)).toBe(placedCard);
		expect(board.cards.at(0)).not.toBe(placedCard);
		expect(board.cards.at(1)).not.toBe(placedCard);
	});

	it('error should be thrown if player tries placing a card he doesnt have in his hand', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

		const placeCard = () => leftPlayer.placeCard(placedCard, board, 0);

		expect(placeCard).toThrowError('Player does not own the card');
	});

	it('should throw an error if the position index is out of bounds', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();

		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

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
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 0);
		const secondPlayerTurn = () => rightPlayer.placeCard(placedCard2, board, 0);

		expect(secondPlayerTurn).toThrowError('Position is already occupied');
	});

	it('should emit event when a card is placed', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });
		let detected = false;
		board.onCardPlaced(() => {
			detected = true;
		});

		leftPlayer.placeCard(placedCard, board, 0);

		expect(detected).toBe(true);
	});

	it('should emitted event transfer card data', () => {
		leftPlayerBuilder.withCardsInHand([placedCard]);
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });
		let detectedCard = null;
		board.onCardPlaced((cardFromEvent) => {
			detectedCard = cardFromEvent;
		});

		leftPlayer.placeCard(placedCard, board, 0);

		expect(detectedCard).toBe(placedCard);
	});
});
