import { writable } from 'svelte/store';
import type { GameEngine } from '../../aggregates/GameEngine';

export const EngineStore = writable<GameEngine | undefined>(undefined)