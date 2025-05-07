import { PlayerModel } from './../../models/player.interface';
import { createAction, props } from '@ngrx/store';

export const loadPlayers = createAction(
    '[Player List] Load Players'
)

export const LoadedPlayers = createAction(
    '[Player List] Loaded Success',
    props<{ Players: any[] }>()
)