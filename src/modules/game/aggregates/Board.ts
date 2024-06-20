import type { Builder } from '$lib/utils/Builder';
import type { Card } from '../entities/Card';
import { CardPlacedEvent } from '../events/CardPlacedEvent';
import { PlacingCardEvent } from '../events/PlacingCardEvent';
import { TurnChangedEvent } from '../events/TurnChangedEvent';
import type { PlacedCard } from './PlacedCard';
import { PlayerBuilder, type Player } from './Player';

type BoardInit = { turn: Player };

export type Board = {
	leftPlayer: Player;
	rightPlayer: Player;
	placedCards: PlacedCard[];
	turn: Player;
	events: {
		placingCard: PlacingCardEvent.Pool;
		cardPlaced: CardPlacedEvent.Pool;
		turnChanged: TurnChangedEvent.Pool;
	};
	onCardPlaced: (fn: (data: CardPlacedEvent.Data) => void) => void;
	onTurnChanged: (fn: (data: TurnChangedEvent.Data) => void) => void;
	cleanUp: () => void;
};

export type BoardBuilder = Builder<Board, BoardInit> & {
	withLeftPlayer: (player: Player) => BoardBuilder;
	withRightPlayer: (player: Player) => BoardBuilder;
	withPlayedCards: (cards: PlacedCard[]) => BoardBuilder;
	withExistingCardPlayed: (index: number, card: PlacedCard) => BoardBuilder;
};

export const BoardBuilder = (): BoardBuilder => {
	const _defaultLeftPlayer = PlayerBuilder().build();
	const _defaultRightPlayer = PlayerBuilder().build();
	const board: Board = {
		leftPlayer: _defaultLeftPlayer,
		rightPlayer: _defaultRightPlayer,
		placedCards: [],
		turn: _defaultLeftPlayer,
		events: {
			placingCard: PlacingCardEvent.getPool(),
			cardPlaced: CardPlacedEvent.getPool(),
			turnChanged: TurnChangedEvent.getPool()
		},
		onCardPlaced: function (fn) {
			this.events.cardPlaced.subscribe(fn);
		},
		onTurnChanged: function (fn) {
			this.events.turnChanged.subscribe(fn);
		},
		cleanUp: function () {
			PlacingCardEvent.clearPool(this.events.placingCard.id);
			CardPlacedEvent.clearPool(this.events.cardPlaced.id);
			TurnChangedEvent.clearPool(this.events.turnChanged.id);
			this.leftPlayer.cleanUp();
			this.rightPlayer.cleanUp();
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
			const firstPlayerToPlay =
				init?.turn || (Math.random() < 0.5 ? board.leftPlayer : board.rightPlayer);
			board.turn = firstPlayerToPlay;

			board.events.placingCard.subscribe(({ player, card, position }) =>
				placeCard(player, card, board, position)
			);

			// Switch turns after a card is placed
			board.events.cardPlaced.subscribe(() => {
				board.turn = board.turn === board.leftPlayer ? board.rightPlayer : board.leftPlayer;
				TurnChangedEvent.emit({ player: board.turn });
			});

			TurnChangedEvent.emit({ player: board.turn });
			return board;
		}
	};
};

const placeCard = (player: Player, card: Card, board: Board, position: number) => {
	const isPlayerOnThisBoard = board.leftPlayer.compare(player) || board.rightPlayer.compare(player);
	if (!isPlayerOnThisBoard) return;

	const isPlayerTurn = board.turn.compare(player);
	if (!isPlayerTurn) {
		throw new Error('It is not your turn');
	}

	const cardOwned = player.cardsInHand.some((c) => c.compare(card));
	if (!cardOwned) {
		throw new Error('Player does not own the card');
	}

	const isPositionIndexOutOfBounds = position < 0 || position >= 10;
	if (isPositionIndexOutOfBounds) {
		throw new Error('Position is out of bounds');
	}

	const isPositionEmpty = board.placedCards[position] === undefined;
	if (!isPositionEmpty) {
		throw new Error('Position is already occupied');
	}

	player.cardsInHand = player.cardsInHand.filter((c) => !c.compare(card));
	board.placedCards[position] = { card: card, player: player };
	CardPlacedEvent.emit({ card, player, position });
};
