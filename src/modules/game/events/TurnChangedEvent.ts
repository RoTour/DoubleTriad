import { EventManager } from '$lib/utils/events/EventManager';
import type { Player } from '../aggregates/Player';

export namespace TurnChangedEvent {
	export type Data = {
		player: Player;
	};

	export type Manager = EventManager<Data>;
	export const Manager = () => EventManager<Data>();
}
