import { BoardBuilder } from '../../modules/game/aggregates/Board';
import { ComputerPlayerBuilder } from '../../modules/game/aggregates/ComputerPlayer';
import { GameEngineBuilder, type GameEngine } from '../../modules/game/aggregates/GameEngine';
import { PlayerBuilder } from '../../modules/game/aggregates/Player';
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
		CardBuilder()
			.withTop(1)
			.withLeft(1)
			.withRight(1)
			.withBottom(1)
			.withName('L. Hernandez')
			.build(),
		CardBuilder().withTop(2).withLeft(2).withRight(2).withBottom(2).withName('R. Varane').build(),
		CardBuilder().withTop(3).withLeft(3).withRight(3).withBottom(3).withName('H. Lloris').build(),
		CardBuilder().withTop(4).withLeft(4).withRight(4).withBottom(4).withName('N. Kante').build(),
		CardBuilder().withTop(5).withLeft(5).withRight(5).withBottom(5).withName('K. Mbappe').build()
	];
	const rightPlayerDeck: Card[] = [
		CardBuilder().withTop(1).withLeft(1).withRight(1).withBottom(1).withName('K. Coman').build(),
		CardBuilder().withTop(2).withLeft(2).withRight(2).withBottom(2).withName('N. Fekir').build(),
		CardBuilder().withTop(3).withLeft(3).withRight(3).withBottom(3).withName('R. Varane').build(),
		CardBuilder().withTop(4).withLeft(4).withRight(4).withBottom(4).withName('P. Pogba').build(),
		CardBuilder().withTop(5).withLeft(5).withRight(5).withBottom(5).withName('A. Griezmann').build()
	];
	const leftPlayer = ComputerPlayerBuilder()
		.withDelay(2000)
		.withStrategy('offensive')
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
	const board = BoardBuilder()
		.withLeftPlayer(leftPlayer)
		.withRightPlayer(rightPlayer)
		.build({ turn: rightPlayer });
	const engine = GameEngineBuilder().withBoard(board).build();

	return engine;
};

export const GameViewModel = (init?: GameViewModelInit): GameViewModel => {
	return {
		gameEngine: init?.engine ?? createNewGameEngine(),
		reset: function () {
			this.gameEngine.cleanUp();
			// return createNewGameEngine();
		}
	};
};
