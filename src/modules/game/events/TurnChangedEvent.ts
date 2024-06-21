import type { EventPool } from '$lib/utils/events/EventPool';
import { Event } from '$lib/utils/events/EventPool';
import type { Grid } from '../aggregates/Grid';
import type { Player } from '../aggregates/Player';

export namespace TurnChangedEvent {
	export type Data = {
		player: Player;
		grid: Grid;
	};

	type Manager = Event<Data>;
	export const Manager = Event<Data>();

	export type Pool = EventPool<Data>;
	export const getPool = () => Manager.createPool();
	export const emit = (data: Data) => Manager.emit(data);
	export const clearPool = (poolId: string) => Manager.removePool(poolId);
}
