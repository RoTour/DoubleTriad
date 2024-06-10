import type { Card } from './Card';
import type { Player } from './Player';

export type Board = {
	redPlayer: Player;
	bluePlayer: Player;
	cards: Card[];
}