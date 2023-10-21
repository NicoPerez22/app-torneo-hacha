import { createReducer, on } from '@ngrx/store';
import { LoadedPlayers, loadPlayers } from '../actions/players.actions';
import { PlayersState } from 'src/app/models/state-models/players.state';

export const initialState: PlayersState = { loading: false, players: [] }
export const playerReducer = createReducer(
    initialState,
    on(loadPlayers, (state) => {
        return { ...state, loading: true }
    }),
    on(LoadedPlayers, (state, { Players }) => {
        return { ...state, loading: false, Players}
    })
);