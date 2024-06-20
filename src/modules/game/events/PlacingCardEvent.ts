import type { EventPool } from '$lib/utils/events/EventPool';
import type { Player } from '../aggregates/Player';
import type { Card } from '../entities/Card';
import { Event } from '$lib/utils/events/EventPool';

export namespace PlacingCardEvent {
	export type Data = {
		card: Card;
		player: Player;
		position: number;
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
