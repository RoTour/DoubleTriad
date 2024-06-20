import { Event, type EventPool } from '$lib/utils/events/EventPool';
import type { Player } from '../aggregates/Player';

export namespace OwnTurnEvent {
	export type Data = {
		player: Player;
	};

	type Manager = Event<Data>;
	const Manager = Event<Data>();

	export type Pool = EventPool<Data>;
	export const getPool = () => Manager.createPool();
	export const emit = (data: Data) => Manager.emit(data);
	export const clearPool = (poolId: string) => Manager.removePool(poolId);
}
