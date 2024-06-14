import { describe, expect, it } from 'vitest';
import { GameEngineBuilder } from '../aggregates/GameEngine';
import { PlayerBuilder } from '../aggregates/Player';
import { BoardBuilder } from '../entities/Board';
import { CardBuilder } from '../entities/Card';

describe('Unit: GameEngine Cleanup', () => {
	it('should remove battleStarted event subscribers', () => {
		const board = BoardBuilder().build();
		const engine = GameEngineBuilder().withBoard(board).build();
		let called = false;
		engine.events.battleStarted.subscribe(() => (called = true));

		engine.cleanUp();
		engine.events.battleStarted.emit({
			fighter: { card: CardBuilder().build(), player: PlayerBuilder().build() },
			defenders: {
				top: { card: CardBuilder().build(), player: PlayerBuilder().build() },
				left: null,
				right: null,
				bottom: null
			}
		});

		expect(called).toBe(false);
	});

	it('should remove battleWon event subscribers', () => {
		const board = BoardBuilder().build();
		const engine = GameEngineBuilder().withBoard(board).build();
		let called = false;
		engine.events.battleWon.subscribe(() => (called = true));

		engine.cleanUp();
		engine.events.battleWon.emit({
			winner: { card: CardBuilder().build(), player: PlayerBuilder().build() },
			loser: { card: CardBuilder().build(), player: PlayerBuilder().build() }
		});

		expect(called).toBe(false);
	});

	it('should remove endOfGame event subscribers', () => {
		const board = BoardBuilder().build();
		const engine = GameEngineBuilder().withBoard(board).build();
		let called = false;
		engine.onGameEnded(() => (called = true));

		engine.cleanUp();

		expect(called).toBe(false);
	});
});

describe('Unit: Board Cleanup', () => {
	it('should remove onCardPlaced event subscribers', () => {
		const playerDeck = [CardBuilder().build()];
		const player = PlayerBuilder().withCardsInHand(playerDeck).build();
		const board = BoardBuilder().withLeftPlayer(player).build({ turn: player });
		const engine = GameEngineBuilder().withBoard(board).build();
		let called = false;
		engine.board.onCardPlaced(() => (called = true));

		engine.cleanUp();
		player.placeCard(playerDeck[0], engine.board, 0);

		expect(called).toBe(false);
	});
});
