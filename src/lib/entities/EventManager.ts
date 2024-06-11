export interface EventManager<T> {
	subscribe(callback: (data: T) => void): string;
	unsubscribe(id: string): void;
	unsubscribeAll(): void;
	emit(data: T): void;
}

export const EventManager = <T>(): EventManager<T> => {
	const subscribers: Map<string, (data: T) => void> = new Map();

	return {
		subscribe: (fn) => {
			const id = Math.random().toString(36).slice(2, 9);
			subscribers.set(id, fn);
			return id;
		},
		unsubscribe: (id) => {
			subscribers.delete(id);
		},
		unsubscribeAll: () => {
			subscribers.clear();
		},
		emit: (data) => {
			subscribers.forEach((fn) => fn(data));
		},
	};
};
