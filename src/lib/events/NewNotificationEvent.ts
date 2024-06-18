import { EventManager } from '$lib/entities/EventManager';
import type { Notification } from '../entities/Notification';

export namespace NewNotificationEvent {
	export type Data = {
		notification: Notification;
	};
	export type Manager = EventManager<Data>;
	export const Manager = () => EventManager<Data>();
}
