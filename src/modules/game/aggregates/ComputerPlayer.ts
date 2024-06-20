import type { Builder } from '$lib/utils/Builder';
import { TurnChangedEvent } from '../events/TurnChangedEvent';
import { PlayerBuilder, type Player } from './Player';

export type ComputerPlayerStrategy = 'random' | 'defensive' | 'offensive';

export type ComputerPlayer = Player & {
	strategy: ComputerPlayerStrategy;
	delay?: number;
	// ----
	playRandomly: () => void;
	cleanUp: () => void;
};

type ComputerPlayerBuilder = PlayerBuilder &
	Builder<ComputerPlayer> & {
		withStrategy: (strategy: ComputerPlayerStrategy) => ComputerPlayerBuilder;
		withDelay: (delay: number | undefined) => ComputerPlayerBuilder;
	};

export const ComputerPlayerBuilder = (): ComputerPlayerBuilder => {
	const baseBuilder = PlayerBuilder();
	const turnChangedEventPool = TurnChangedEvent.getPool();
	const _cp: Omit<ComputerPlayer, keyof Player> & { cleanUp: () => void } = {
		strategy: 'random',
		playRandomly,
		cleanUp: cleanUpCP.bind(null, turnChangedEventPool.id)
	};
	return {
		...baseBuilder,
		withStrategy: function (strategy: ComputerPlayerStrategy) {
			_cp.strategy = strategy;
			return this;
		},
		withDelay: function (delay: number | undefined) {
			_cp.delay = delay;
			return this;
		},
		build: () => {
			const cp: ComputerPlayer = { ...baseBuilder.build(), ..._cp };
			turnChangedEventPool.subscribe(({ player }) => {
				if (!cp.compare(player)) return;
				if (cp.delay) return setTimeout(() => cp.playRandomly(), cp.delay);
				cp.playRandomly();
			});
			return cp;
		}
	};
};

function playRandomly(this: ComputerPlayer) {
	if (this.cardsInHand.length === 0) {
		throw new Error('No cards in hand');
	}
	const randomCard = this.cardsInHand[Math.floor(Math.random() * this.cardsInHand.length)];
	const randomPosition = Math.floor(Math.random() * 10);
	this.placeCard(randomCard, randomPosition);
}

function cleanUpCP(poolId: string) {
	TurnChangedEvent.clearPool(poolId);
}
