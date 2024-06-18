import { NewNotificationEvent } from '$lib/events/NewNotificationEvent';
import { IdGenerator } from '$lib/utils/IdGenerator';
import type { Builder } from './Builder';

export type Notification = {
	id: string;
	title: string;
	description?: string;
	type: 'info' | 'warning' | 'error' | 'success';
	expiration?: number;
	// ----
	send: () => Notification;
};

export type NotificationBuilder = Builder<Notification> & {
	withTitle: (title: string) => NotificationBuilder;
	withDescription: (description: string) => NotificationBuilder;
	withType: (type: 'info' | 'warning' | 'error' | 'success') => NotificationBuilder;
	send: () => Notification;
};

const _NotificationCenter = () => {
	const _data = {
		events: {
			newNotification: NewNotificationEvent.Manager()
		}
	};
	return {
		onNewNotification: (callback: (data: NewNotificationEvent.Data) => void) => {
			_data.events.newNotification.subscribe(callback);
		},
		sendNewNotification: (notification: NewNotificationEvent.Data) => {
			_data.events.newNotification.emit(notification);
		},
		cleanUp: () => {
			_data.events.newNotification.unsubscribeAll();
		}
	};
};
export const NotificationCenter = _NotificationCenter();

export const NotificationBuilder = () => {
	const notification: Notification = {
		id: IdGenerator.shortString(),
		title: '',
		type: 'info',
		send: send,
		expiration: 10000
	};

	return {
		withTitle: function (title: string) {
			notification.title = title;
			return this;
		},
		withDescription: function (description: string) {
			notification.description = description;
			return this;
		},
		withType: function (type: 'info' | 'warning' | 'error' | 'success') {
			notification.type = type;
			return this;
		},
		send: () => {
			return notification.send();
		},
		build: function () {
			return notification;
		}
	};
};

const send = function (this: Notification): Notification {
	NotificationCenter.sendNewNotification({ notification: this });
	return this;
};

// export class Notification {
// 	id: string;
// 	title: string;
// 	description?: string;
// 	type: 'info' | 'warning' | 'error' | 'success';
// 	private static events = NotificationCoreEvents;

// 	private constructor(id: string, title: string, type: 'info' | 'warning' | 'error' | 'success', description?: string) {
// 		this.id = id;
// 		this.title = title;
// 		this.type = type;
// 		this.description = description;
// 		return this;
// 	}

// 	static create(title: string, type: 'info' | 'warning' | 'error' | 'success' = 'info', description?: string) {
// 		const id = Math.random().toString(36).slice(2, 9);
// 		return new Notification(id, title, type, description).send();
// 	}

// 	private send() {
// 		Notification.events.newNotificationEvent.emit(this);
// 		return this;
// 	}

// 	delete() {
// 		Notification.events.notificationDeletedEvent.emit(this);
// 	}
// }
