import { afterEach, describe, expect, it } from 'vitest';
import { BoardBuilder } from '../aggregates/Board';
import { GameEngineBuilder, type GameEngine } from '../aggregates/GameEngine';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder } from '../entities/Card';

describe('Unit:Scoring', () => {
	const leftPlayerBuilder = PlayerBuilder().withId('1').withName('Left Player').withScore(5);
	const rightPlayerBuilder = PlayerBuilder().withId('2').withName('RightPlayer').withScore(5);
	let engine: GameEngine;

	afterEach(() => {
		engine?.cleanUp();
	});

	it('should add one to player score when player wins against adjacent enemy', () => {
		const winningCard = CardBuilder().withLeft(2).build();
		const leftPlayer = leftPlayerBuilder.build();
		const rightPlayer = rightPlayerBuilder.withCardsInHand([winningCard]).build();
		const board = BoardBuilder()
			.withLeftPlayer(leftPlayer)
			.withRightPlayer(rightPlayer)
			.withExistingCardPlayed(3, { card: CardBuilder().withRight(1).build(), player: leftPlayer })
			.build({ turn: rightPlayer });
		engine = GameEngineBuilder().withBoard(board).build();

		rightPlayer.placeCard(winningCard, 4);

		expect(rightPlayer.score).toBe(6);
		expect(leftPlayer.score).toBe(4);
	});
});
