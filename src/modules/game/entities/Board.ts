import type { Builder } from '$lib/entities/Builder';
import type { PlacedCard } from '../aggregates/PlacedCard';
import { PlayerAreEqual, PlayerBuilder, type Player } from '../aggregates/Player';
import { CardPlacedEvent } from '../events/CardPlacedEvent';
import { TurnChangedEvent } from '../events/TurnChangedEvent';

export type Board = {
	leftPlayer: Player;
	rightPlayer: Player;
	placedCards: PlacedCard[];
	turn: Player;
	events: {
		cardPlaced: CardPlacedEvent.Manager;
		turnChanged: TurnChangedEvent.Manager;
	};
	onCardPlaced: (fn: (data: CardPlacedEvent.Data) => void) => void;
	onTurnChanged: (fn: (data: TurnChangedEvent.Data) => void) => void;
	cleanUp: () => void;
}

export type BoardBuilder = Builder<Board> & {
	withLeftPlayer: (player: Player) => BoardBuilder;
	withRightPlayer: (player: Player) => BoardBuilder;
	withPlayedCards: (cards: PlacedCard[]) => BoardBuilder;
	withExistingCardPlayed: (index: number, card: PlacedCard) => BoardBuilder;
};

export const BoardBuilder = (): BoardBuilder => {
	const _leftPlayer = PlayerBuilder().build();
	const _rightPlayer = PlayerBuilder().build();
	const board: Board = {
		leftPlayer: _leftPlayer,
		rightPlayer: _rightPlayer,
		placedCards: [],
		turn: _leftPlayer,
		events: {
			cardPlaced: CardPlacedEvent.Manager,
			turnChanged: TurnChangedEvent.Manager
		},
		onCardPlaced: (fn) => {
			board.events.cardPlaced.subscribe(fn)
		},
		onTurnChanged: (fn) => {
			board.events.turnChanged.subscribe(fn)
		},
		cleanUp: () => {
			board.events.cardPlaced.unsubscribeAll();
		}
	};

	return {
		withLeftPlayer: function (player: Player) {
			board.leftPlayer = player;
			return this;
		},
		withRightPlayer: function (player: Player) {
			board.rightPlayer = player;
			return this;
		},
		withPlayedCards: function (cards: PlacedCard[]) {
			board.placedCards = cards;
			return this;
		},
		withExistingCardPlayed: function (index: number, card: PlacedCard) {
			board.placedCards[index] = card;
			return this;
		},
		build: function (init?: { turn: Player }) {
			// Randomly choose who goes first if not specified
			const firstPlayerToPlay = init?.turn || (Math.random() < 0.5 ? board.leftPlayer : board.rightPlayer);
			board.turn = firstPlayerToPlay;

			// Switch turns after a card is placed
			board.events.cardPlaced.subscribe(() => {
				console.debug('Card placed, switching turns from', board.turn.name, 'to', PlayerAreEqual(board.turn, board.leftPlayer) ? board.rightPlayer.name : board.leftPlayer.name);
				board.turn = PlayerAreEqual(board.turn, board.leftPlayer) ? board.rightPlayer : board.leftPlayer;
				board.events.turnChanged.emit({ player: board.turn });
			});

			return board;
		}
	}
}