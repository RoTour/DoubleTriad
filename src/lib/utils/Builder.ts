export type Builder<Output = void, Input = void> = {
	build: (init?: Input) => Output;
};
