import { EventManager } from '$lib/entities/EventManager';
import type { PlacedCard } from '../aggregates/PlacedCard';

export namespace BattleWonEvent {
	export type Data = {
		winner: PlacedCard;
		loser: PlacedCard;
	};
	export type Manager = EventManager<Data>;
	export const Manager = EventManager<Data>();
}