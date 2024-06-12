import type { Card } from '../entities/Card';
import type { Player } from './Player';

export type PlacedCard = {
	card: Card;
	player: Player;
}