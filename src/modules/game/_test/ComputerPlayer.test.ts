import { afterEach, describe, expect, it } from 'vitest';
import { GameEngineBuilder, type GameEngine } from '../aggregates/GameEngine';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder } from '../entities/Card';
import { BoardBuilder } from '../aggregates/Board';
import { ComputerPlayerBuilder } from '../aggregates/ComputerPlayer';

// cp = computer player
describe('Unit:ComputerPlayer', () => {
	let engine: GameEngine;

	afterEach(() => {
		engine?.cleanUp();
	});
	it('Cp should place card on board when he has the first turn', () => {
		const cpCards = [CardBuilder().build()];
		const hp = PlayerBuilder().withName('Player').build();
		const cp = ComputerPlayerBuilder().withName('Computer').withCardsInHand(cpCards).build();
		console.debug('cp', cp);
		const board = BoardBuilder().withLeftPlayer(hp).withRightPlayer(cp).build({ turn: cp });
		engine = GameEngineBuilder().withBoard(board).build();

		const cpCardHasBeenPlaced = engine.board.placedCards.some((c) => c.card.compare(cpCards[0]));
		expect(engine.board.turn).toBe(hp);
		expect(cpCardHasBeenPlaced).toBe(true);
	});
});
