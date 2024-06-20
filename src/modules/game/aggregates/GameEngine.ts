import type { Builder } from '$lib/utils/Builder';
import { BattleStartedEvent, type AdjacentEnemeies } from '../events/BattleStartedEvent';
import { BattleWonEvent } from '../events/BattleWonEvent';
import type { CardPlacedEvent } from '../events/CardPlacedEvent';
import { EndOfGameEvent } from '../events/EndOfGameEvent';
import { BoardBuilder, type Board } from './Board';
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
		battleStarted: BattleStartedEvent.Pool;
		battleEnded: BattleWonEvent.Pool;
		endOfGame: EndOfGameEvent.Pool;
	};
	detectAdjacentEnemies: (board: Board, player: Player, position: number) => AdjacentEnemeies;
	calculateCardsBeaten: (placedCard: PlacedCard, adjacentEnemies: AdjacentEnemeies) => PlacedCard[];
	changeOwner: (placedCard: PlacedCard[], newOwner: Player) => void;
	checkForBattle: (data: CardPlacedEvent.Data) => void; // check if card placed triggers a battle
	handleEndOfGame: () => void; // check if board is full and end game
	onGameEnded: (fn: (data: EndOfGameEvent.Data) => void) => void;
	onBattleEnded: (fn: (data: BattleWonEvent.Data) => void) => void;
	cleanUp: () => void;
};

export type GameEngineBuilder = Builder<GameEngine> & {
	withBoard: (board: Board) => GameEngineBuilder;
};

export const GameEngineBuilder = (): GameEngineBuilder => {
	const engine: GameEngine = {
		board: BoardBuilder().build(),
		events: {
			battleStarted: BattleStartedEvent.getPool(),
			battleEnded: BattleWonEvent.getPool(),
			endOfGame: EndOfGameEvent.getPool()
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
			return cardsBeaten;
		},
		changeOwner: (placedCard: PlacedCard[], newOwner: Player) => {
			placedCard.forEach((card) => (card.player = newOwner));
		},
		handleEndOfGame: function () {
			console.debug('Checking for end of game');
			const cards = engine.board.placedCards;
			const isBoardFull =
				cards.length === 9 &&
				cards[0] &&
				cards[1] &&
				cards[2] &&
				cards[3] &&
				cards[4] &&
				cards[5] &&
				cards[6] &&
				cards[7] &&
				cards[8];
			if (!isBoardFull) return;
			const isDraw = engine.board.leftPlayer.score === engine.board.rightPlayer.score;
			if (isDraw) {
				EndOfGameEvent.emit({
					isDraw: true,
					players: [engine.board.leftPlayer, engine.board.rightPlayer]
				});
				return;
			}
			const winner =
				engine.board.leftPlayer.score > engine.board.rightPlayer.score
					? engine.board.leftPlayer
					: engine.board.rightPlayer;

			const loser =
				engine.board.leftPlayer.score < engine.board.rightPlayer.score
					? engine.board.leftPlayer
					: engine.board.rightPlayer;

			EndOfGameEvent.emit({
				isDraw: false,
				winner: { player: winner, score: winner.score },
				loser: { player: loser, score: loser.score }
			});
		},
		onBattleEnded: (fn) => {
			engine.events.battleEnded.subscribe(fn);
		},
		onGameEnded: (fn) => {
			engine.events.endOfGame.subscribe(fn);
		},
		checkForBattle: ({ card, player, position }) => {
			console.debug('Checking for battle');
			const adjacentEnemies = engine.detectAdjacentEnemies(engine.board, player, position);
			if (
				!adjacentEnemies.top &&
				!adjacentEnemies.left &&
				!adjacentEnemies.right &&
				!adjacentEnemies.bottom
			) {
				return;
			}
			BattleStartedEvent.emit({
				fighter: { player, card },
				defenders: adjacentEnemies
			});
		},
		cleanUp: () => {
			BattleStartedEvent.clearPool(engine.events.battleStarted.id);
			EndOfGameEvent.clearPool(engine.events.endOfGame.id);
			BattleWonEvent.clearPool(engine.events.battleEnded.id);
			engine.board.cleanUp();
		}
	};

	return {
		withBoard: function (board: Board) {
			engine.board.cleanUp();
			engine.board = board;
			return this;
		},
		build: function () {
			// Check if placed card triggers a battle
			engine.board.events.cardPlaced.subscribe(engine.checkForBattle);

			// Compute battle results when a battle is triggered
			engine.events.battleStarted.subscribe(({ fighter, defenders }) => {
				const cardsBeaten = engine.calculateCardsBeaten(fighter, defenders);
				cardsBeaten.forEach((cardBeaten) => {
					BattleWonEvent.emit({
						winner: fighter,
						loser: cardBeaten
					});
				});
				engine.changeOwner(cardsBeaten, fighter.player);
			});

			// Update player scores when a battle is won
			engine.events.battleEnded.subscribe(({ winner, loser }) => {
				winner.player.score++;
				loser.player.score--;
			});

			// Detect board is full and end game
			engine.board.events.cardPlaced.subscribe(engine.handleEndOfGame);

			return engine;
		}
	};
};
