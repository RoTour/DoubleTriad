import { describe, expect, it } from 'vitest';
import { BoardBuilder } from '../aggregates/Board';
import { GameEngineBuilder } from '../aggregates/GameEngine';
import { PlayerBuilder } from '../aggregates/Player';
import { CardBuilder } from '../entities/Card';
import { BattleStartedEvent } from '../events/BattleStartedEvent';
import { BattleWonEvent } from '../events/BattleWonEvent';
import { ComputerPlayerBuilder } from '../aggregates/ComputerPlayer';
import { TurnChangedEvent } from '../events/TurnChangedEvent';

describe('Unit: GameEngine Cleanup', () => {
	it('should remove battleStarted event subscribers', () => {
		const board = BoardBuilder().build();
		const engine = GameEngineBuilder().withBoard(board).build();
		let called = false;
		engine.events.battleStarted.subscribe(() => (called = true));

		engine.cleanUp();
		BattleStartedEvent.emit({
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
		engine.events.battleEnded.subscribe(() => (called = true));

		engine.cleanUp();
		BattleWonEvent.emit({
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
		player.placeCard(playerDeck[0], 0);

		expect(called).toBe(false);
	});
});

describe('Unit: Player Cleanup', () => {
	it('should remove TurnChangedEvent subscribers', () => {
		const player = ComputerPlayerBuilder().withDelay(10000).build();
		const board = BoardBuilder().withRightPlayer(player).build({ turn: player });

		let nbOfSubs = TurnChangedEvent.Manager.pools.size;
		expect(nbOfSubs).toBe(2);

		board.cleanUp();

		nbOfSubs = TurnChangedEvent.Manager.pools.size;
		expect(nbOfSubs).toBe(0);
	});
});
