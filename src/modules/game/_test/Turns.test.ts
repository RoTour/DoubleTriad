import { describe, expect, it } from 'vitest';
import { BoardBuilder } from '../aggregates/Board';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder } from '../entities/Card';

describe('Unit:Turns', () => {
	const leftPlayerBuilder = PlayerBuilder().withId('1').withName('Player 1').withScore(0);
	const rightPlayerBuilder = PlayerBuilder().withId('2').withName('Player 2').withScore(0);
	const placedCard = CardBuilder().build();
	
	it('should define turn when game starts', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: leftPlayer });

		expect(board.turn === leftPlayer || board.turn === rightPlayer).toBe(true);
	});

	it('should define turn when game starts with custom turn', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: rightPlayer });

		expect(board.turn).toBe(rightPlayer);
	});

	it('should switch turn after a card is placed', () => {
		const leftPlayer = leftPlayerBuilder.withCardsInHand([placedCard]).build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: leftPlayer });

		leftPlayer.placeCard(placedCard, board, 0);

		expect(board.turn).toBe(rightPlayer);
	});

	it('should throw an error if a player tries to place a card when it is not his turn', () => {
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.build({ turn: rightPlayer });

		const placeCard = () => leftPlayer.placeCard(placedCard, board, 0);

		expect(placeCard).toThrowError('It is not your turn');
	});
})