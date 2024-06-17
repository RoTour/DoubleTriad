import { GameEngineBuilder, type GameEngine } from '../../modules/game/aggregates/GameEngine';
import { PlayerBuilder } from '../../modules/game/aggregates/Player';
import { BoardBuilder } from '../../modules/game/entities/Board';
import { CardBuilder, type Card } from '../../modules/game/entities/Card';

export type GameViewModelData = {
	gameEngine: GameEngine;
};

export type GameViewModelInit = {
	engine?: GameEngine;
};

export type GameViewModel = {
	gameEngine: GameEngine;
	reset: () => void;
};

const createNewGameEngine = (): GameEngine => {
	const leftPlayerDeck: Card[] = [
		CardBuilder().withTop(1).withLeft(1).withRight(1).withBottom(1).build(),
		CardBuilder().withTop(2).withLeft(2).withRight(2).withBottom(2).build(),
		CardBuilder().withTop(3).withLeft(3).withRight(3).withBottom(3).build(),
		CardBuilder().withTop(4).withLeft(4).withRight(4).withBottom(4).build(),
		CardBuilder().withTop(5).withLeft(5).withRight(5).withBottom(5).build(),
	];
	const rightPlayerDeck: Card[] = [
		CardBuilder().withTop(1).withLeft(1).withRight(1).withBottom(1).build(),
		CardBuilder().withTop(2).withLeft(2).withRight(2).withBottom(2).build(),
		CardBuilder().withTop(3).withLeft(3).withRight(3).withBottom(3).build(),
		CardBuilder().withTop(4).withLeft(4).withRight(4).withBottom(4).build(),
		CardBuilder().withTop(5).withLeft(5).withRight(5).withBottom(5).build(),
	];
	const leftPlayer = PlayerBuilder()
		.withName('Player RED')
		.withScore(5)
		.withId('1')
		.withCardsInHand(leftPlayerDeck)
		.build();
	const rightPlayer = PlayerBuilder()
		.withName('Player BLUE')
		.withScore(5)
		.withId('2')
		.withCardsInHand(rightPlayerDeck)
		.build();
	const board = BoardBuilder().withLeftPlayer(leftPlayer).withRightPlayer(rightPlayer).build({ turn: rightPlayer });
	const engine = GameEngineBuilder().withBoard(board).build();

	return engine;
};

export const GameViewModel = (init?: GameViewModelInit): GameViewModel => {
	return {
		gameEngine: init?.engine ?? createNewGameEngine(),
		reset: function() {
			this.gameEngine.cleanUp();
			// return createNewGameEngine();
		}
	};
};
