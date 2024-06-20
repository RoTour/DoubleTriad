import { Event, type EventPool } from '$lib/utils/events/EventPool';
import type { PlacedCard } from '../aggregates/PlacedCard';

export type AdjacentEnemeies = {
	top: PlacedCard | null;
	left: PlacedCard | null;
	right: PlacedCard | null;
	bottom: PlacedCard | null;
};

export namespace BattleStartedEvent {
	export type Data = {
		fighter: PlacedCard;
		defenders: AdjacentEnemeies;
	};
	// export type Manager = EventManager<Data>;
	// export const Manager = () => EventManager<Data>();

	type Manager = Event<Data>;
	export const Manager = Event<Data>();

	export type Pool = EventPool<Data>;
	export const getPool = () => Manager.createPool();
	export const emit = (data: Data) => Manager.emit(data);
	export const clearPool = (poolId: string) => Manager.removePool(poolId);
}
