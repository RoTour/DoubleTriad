import type { Grid } from '../aggregates/Grid';
import type { Player } from '../aggregates/Player';
import type { Card } from '../entities/Card';

export type NextMove = {
	card: Card;
	position: number;
};

export type IPlayerStrategy = {
	computeMove: (grid: Grid, player: Player) => NextMove;
};
