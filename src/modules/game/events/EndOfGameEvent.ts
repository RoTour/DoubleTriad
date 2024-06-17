import { EventManager } from '$lib/entities/EventManager';
import type { Player } from '../aggregates/Player';

export namespace EndOfGameEvent {
	export type Data = {
		isDraw: false;
		winner: {
			player: Player;
			score: number;
		};
		loser: {
			player: Player;
			score: number;
		};
	} | {
		isDraw: true;
		players: Player[];
	};
	export type Manager = EventManager<Data>;
	export const Manager = () => EventManager<Data>();
}