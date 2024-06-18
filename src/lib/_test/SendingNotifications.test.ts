import { NotificationBuilder, NotificationCenter } from '$lib/entities/Notification';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Notification } from '$lib/entities/Notification';

describe('Unit:SendingNotifications', () => {
	beforeEach(() => {
		NotificationCenter.cleanUp();
	});

	it('should detect sent notifications', () => {
		const notification = NotificationBuilder().withTitle('Testing').send();

		let receivedNotification: Notification | null = null;
		NotificationCenter.onNewNotification(({ notification }) => {
			receivedNotification = notification;
		});

		notification.send();

		expect(notification).toBe(receivedNotification);
	});
});
