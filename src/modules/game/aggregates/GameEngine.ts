import type { Builder } from '$lib/entities/Builder';
import { BoardBuilder, type Board } from '../entities/Board';
import { BattleStartedEvent, type AdjacentEnemeies } from '../events/BattleStartedEvent';
import { BattleWonEvent } from '../events/BattleWonEvent';
import type { CardPlacedEvent } from '../events/CardPlacedEvent';
import type { PlacedCard } from './PlacedCard';
import type { Player } from './Player';

/**
 * A Battle is an event that occurs when a card is placed next to an enemy card.
 * The card placed is the fighter and the adjacent enemy cards are the defenders.
 * If the figther's direction stat is higher than the defender's opposite direction stat, the defender is beaten.
 * When a defender is beaten, the card is captured by the fighter, and the player that placed the
 *   card's score is increased by 1.
 * If the defender is not beaten, the card is not captured and the player's score is not increased.
 */
export type GameEngine = {
	board: Board;
	events: {
		battleStarted: BattleStartedEvent.Manager;
		battleWon: BattleWonEvent.Manager;
	};
	detectAdjacentEnemies: (board: Board, player: Player, position: number) => AdjacentEnemeies;
	calculateCardsBeaten: (placedCard: PlacedCard, adjacentEnemies: AdjacentEnemeies) => PlacedCard[];
	changeOwner: (placedCard: PlacedCard[], newOwner: Player) => void;
	checkForBattle: (data: CardPlacedEvent.Data) => void; // check if card placed triggers a battle
	onBattleStarted: (fn: () => void) => void; // subscribe to battle started event
};

export type GameEngineBuilder = Builder<GameEngine> & {
	withBoard: (board: Board) => GameEngineBuilder;
};

export const GameEngineBuilder = (): GameEngineBuilder => {
	const engine: GameEngine = {
		board: BoardBuilder().build(),
		events: {
			battleStarted: BattleStartedEvent.Manager,
			battleWon: BattleWonEvent.Manager
		},
		detectAdjacentEnemies: (board: Board, player: Player, position: number): AdjacentEnemeies => {
			const isAgainstLeftWall = position % 3 === 0;
			const isAgainstRightWall = position % 3 === 2;
			const isEnemy = (card: PlacedCard | null) => card !== null && card?.player !== player;
			const topCard = board.placedCards.at(position - 3) ?? null;
			const leftCard = isAgainstLeftWall ? null : board.placedCards.at(position - 1) ?? null;
			const rightCard = isAgainstRightWall ? null : board.placedCards.at(position + 1) ?? null;
			const bottomCard = board.placedCards.at(position + 3) ?? null;
			return {
				top: isEnemy(topCard) ? topCard : null,
				left: isEnemy(leftCard) ? leftCard : null,
				right: isEnemy(rightCard) ? rightCard : null,
				bottom: isEnemy(bottomCard) ? bottomCard : null
			};
		},
		calculateCardsBeaten: function (placedCard: PlacedCard, adjacentEnemies: AdjacentEnemeies) {
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
			cardsBeaten.forEach((cardBeaten) => {
				this.events.battleWon.emit({
					winner: placedCard,
					loser: cardBeaten
				})
			})
			return cardsBeaten;
		},
		changeOwner: (placedCard: PlacedCard[], newOwner: Player) => {
			placedCard.forEach((card) => (card.player = newOwner));
		},
		checkForBattle: ({ card, player, position }) => {
			const adjacentEnemies = engine.detectAdjacentEnemies(engine.board, player, position);
			if (
				!adjacentEnemies.top &&
				!adjacentEnemies.left &&
				!adjacentEnemies.right &&
				!adjacentEnemies.bottom
			) {
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
			engine.events.battleStarted.subscribe(({ fighter, defenders }) => {
				const cardsBeaten = engine.calculateCardsBeaten(fighter, defenders);
				engine.changeOwner(cardsBeaten, fighter.player);
			});
			engine.events.battleWon.subscribe(({ winner, loser }) => {
				winner.player.score++;
				loser.player.score--;
			});
			return engine;
		}
	};
};
