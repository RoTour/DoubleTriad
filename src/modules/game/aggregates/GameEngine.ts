import type { Builder } from '$lib/entities/Builder';
import { BoardBuilder, type Board } from '../entities/Board';
import type { Card } from '../entities/Card';
import { BattleStartedEvent, type AdjacentEnemeies } from '../events/BattleStartedEvent';
import type { CardPlacedEvent } from '../events/CardPlacedEvent';
import type { PlacedCard } from './PlacedCard';
import type { Player } from './Player';

export type GameEngine = {
	board: Board;
	events: {
		battleStarted: BattleStartedEvent.Manager;
	};
	detectAdjacentEnemies: (board: Board, player: Player, position: number) => AdjacentEnemeies;
	calculateCardsBeaten: (placedCard: PlacedCard, adjacentEnemies: AdjacentEnemeies) => PlacedCard[];
	changeOwner: (placedCard: PlacedCard[], newOwner: Player) => void;
	checkForBattle: (data: CardPlacedEvent.Data) => void;
	onBattleStarted: (fn: () => void) => void;
};

export type GameEngineBuilder = Builder<GameEngine> & {
	withBoard: (board: Board) => GameEngineBuilder;
};

export const GameEngineBuilder = (): GameEngineBuilder => {
	const engine: GameEngine = {
		board: BoardBuilder().build(),
		events: {
			battleStarted: BattleStartedEvent.Manager
		},
		detectAdjacentEnemies: (board: Board, player: Player, position: number): AdjacentEnemeies => {
			const isAgainstLeftWall = position % 3 === 0;
			const isAgainstRightWall = position % 3 === 2;
			const isEnemy = (card: PlacedCard | null) => (card !== null) && (card?.player !== player);
			const topCard = board.placedCards.at(position - 3) ?? null
			const leftCard = isAgainstLeftWall ? null : board.placedCards.at(position - 1) ?? null;
			const rightCard = isAgainstRightWall ? null : board.placedCards.at(position + 1) ?? null;
			const bottomCard = board.placedCards.at(position + 3) ?? null
			return {
				top: isEnemy(topCard) ? topCard : null,
				left: isEnemy(leftCard) ? leftCard : null,
				right: isEnemy(rightCard) ? rightCard : null,
				bottom: isEnemy(bottomCard) ? bottomCard : null,
			}
		},
		calculateCardsBeaten: (placedCard: PlacedCard, adjacentEnemies: AdjacentEnemeies) => {
			const cardsBeaten: PlacedCard[] = [];
			if (adjacentEnemies.top && placedCard.card.top > adjacentEnemies.top.card.bottom) {
				cardsBeaten.push(adjacentEnemies.top);
			}
			if (adjacentEnemies.left && placedCard.card.left > adjacentEnemies.left.card.right) {
				cardsBeaten.push(adjacentEnemies.left);
			}
			if (adjacentEnemies.right && placedCard.card.right > adjacentEnemies.right.card.left) {
				cardsBeaten.push(adjacentEnemies.right);
			}
			if (adjacentEnemies.bottom && placedCard.card.bottom > adjacentEnemies.bottom.card.top) {
				cardsBeaten.push(adjacentEnemies.bottom);
			}
			return cardsBeaten;
		},
		changeOwner: (placedCard: PlacedCard[], newOwner: Player) => {
			placedCard.forEach((card) => card.player = newOwner);
		},
		checkForBattle: ({ card, player, position }) => {
			const adjacentEnemies = engine.detectAdjacentEnemies(engine.board, player, position);
			if (!adjacentEnemies.top && !adjacentEnemies.left && !adjacentEnemies.right && !adjacentEnemies.bottom) {
				return;
			}
			engine.events.battleStarted.emit({
				fighter: { player, card },
				defenders: adjacentEnemies
			});
		},
		onBattleStarted: (fn) => {
			engine.events.battleStarted.subscribe(fn);
		}
	};

	return {
		withBoard: function (board: Board) {
			engine.board = board;
			return this;
		},
		build: function () {
			engine.board.events.cardPlaced.subscribe(engine.checkForBattle);
			engine.events.battleStarted.subscribe(({fighter, defenders}) => {
				const cardsBeaten = engine.calculateCardsBeaten(fighter, defenders);
				engine.changeOwner(cardsBeaten, fighter.player);
			});
			return engine;
		}
	};
};
