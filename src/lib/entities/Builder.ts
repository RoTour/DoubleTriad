export type Builder<T> = {
	build: (init?: any) => T;
}