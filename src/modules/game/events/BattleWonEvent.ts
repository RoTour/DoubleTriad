import type { PlacedCard } from '../aggregates/PlacedCard';
import { Event, type EventPool } from '$lib/utils/events/EventPool';

export namespace BattleWonEvent {
	export type Data = {
		winner: PlacedCard;
		loser: PlacedCard;
	};

	type Manager = Event<Data>;
	export const Manager = Event<Data>();

	export type Pool = EventPool<Data>;
	export const getPool = () => Manager.createPool();
	export const emit = (data: Data) => Manager.emit(data);
	export const clearPool = (poolId: string) => Manager.removePool(poolId);
}
