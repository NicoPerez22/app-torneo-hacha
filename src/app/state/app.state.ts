import { ActionReducerMap } from '@ngrx/store';
import { PlayersState } from 'src/app/models/state-models/players.state';
import { playerReducer } from './reduce/player.reduce';

export interface AppState {
    players: PlayersState
}

export const ROOT_REDUCERS: ActionReducerMap<AppState> = {
    players: playerReducer
}