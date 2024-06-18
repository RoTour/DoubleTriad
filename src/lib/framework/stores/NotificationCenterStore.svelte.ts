import { NotificationCenter } from '$lib/entities/Notification';

function notificationCenterStore() {
	const _notificationCenter: NotificationCenter = $state(NotificationCenter);
	return {
		get instance() {
			return _notificationCenter;
		}
	};
}

export const notificationCenter = notificationCenterStore();
