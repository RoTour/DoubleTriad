import type { Builder } from '$lib/utils/Builder';
import type { OwnTurnEvent } from '../events/OwnTurnEvent';
import { PlayerBuilder, type Player } from './Player';

export type ComputerPlayerStrategy = 'random' | 'defensive' | 'offensive';

export type ComputerPlayer = Player & {
	strategy: ComputerPlayerStrategy;
	events: {
		ownTurn: OwnTurnEvent.Manager;
	};
};

type ComputerPlayerBuilder = PlayerBuilder &
	Builder<ComputerPlayer> & {
		withStrategy: (strategy: ComputerPlayerStrategy) => ComputerPlayerBuilder;
	};

export const ComputerPlayerBuilder = (): ComputerPlayerBuilder => {
	const baseBuilder = PlayerBuilder();
	const _cp: ComputerPlayer = {
		...baseBuilder.build(),
		strategy: 'random'
	};
	return {
		...baseBuilder,
		withStrategy: function (strategy: ComputerPlayerStrategy) {
			_cp.strategy = strategy;
			return this;
		},
		build: () => {
			_cp.events.ownTurn.subscribe(() => {});
			return { ..._cp, ...baseBuilder.build() };
		}
	};
};

// TODO: find a way to access the board from the computer player
// function playRandomly(this: ComputerPlayer) {
// 	const randomCard = this.cardsInHand[Math.floor(Math.random() * this.cardsInHand.length)];
// 	const randomPosition = Math.floor(Math.random() * 10);
// 	this.placeCard(randomCard, this.board, randomPosition);
// }
