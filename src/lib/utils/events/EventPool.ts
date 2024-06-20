import { IdGenerator } from '../IdGenerator';

export type EventPool<T> = {
	id: string;
	subscribers: Map<string, (data: T) => void>;
	// ----
	subscribe: (callback: (data: T) => void) => string;
	unsubscribe: (id: string) => void;
	unsubscribeAll: () => void;
};

const EventPool = <T>(id: string): EventPool<T> => {
	const subscribers: Map<string, (data: T) => void> = new Map();

	return {
		id,
		subscribers,
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
		}
	};
};

export type Event<T> = {
	pools: Map<string, EventPool<T>>;
	emit: (data: T) => void;
	createPool: () => EventPool<T>;
	removePool: (id: string) => void;
};

export const Event = <T>(): Event<T> => {
	const pools: Map<string, EventPool<T>> = new Map();

	return {
		pools,
		emit: (data) => {
			pools.forEach((pool) => {
				pool.subscribers.forEach((fn) => fn(data));
			});
		},
		createPool: () => {
			const pool = EventPool<T>(IdGenerator.shortString());
			pools.set(pool.id, pool);
			return pool;
		},
		removePool: (id: string) => {
			pools.get(id)?.unsubscribeAll();
			pools.delete(id);
		}
	};
};
