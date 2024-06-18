import { EventManager } from '$lib/entities/EventManager';
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
	export type Manager = EventManager<Data>;
	export const Manager = () => EventManager<Data>();
}
