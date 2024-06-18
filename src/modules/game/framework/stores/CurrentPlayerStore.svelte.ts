import type { Player } from '../../aggregates/Player';

const CurrentPlayerStore = () => {
	let _value: Player | null = $state(null);

	return {
		get value() {
			return _value;
		},
		set value(player: Player | null) {
			_value = player;
		}
	};
};

export const currentPlayerStore = CurrentPlayerStore();
