import { EventManager } from '$lib/entities/EventManager';
import type { Player } from '../aggregates/Player';
import type { Card } from '../entities/Card';

export namespace CardPlacedEvent {
	export type Data = {
		card: Card;
		player: Player;
		position: number;
	};
	export type Manager = EventManager<Data>;
	export const Manager = () => EventManager<Data>();
}
