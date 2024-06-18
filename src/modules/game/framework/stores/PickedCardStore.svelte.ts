import type { Card } from '../../entities/Card';

type PickedCard = Card | null;

function pickedCardStore() {
	let _card: PickedCard = $state(null);

	return {
		get card () { return _card },
		set: (card: PickedCard) => _card = card
   };
}

export const pickedCard = pickedCardStore();