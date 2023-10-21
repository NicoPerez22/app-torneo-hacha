import { PlayersState } from 'src/app/models/state-models/players.state';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
 
export const selectPlayersFeature = (state: AppState) => state.players;
 
export const selectListPlayers = createSelector(
    selectPlayersFeature,
    (state: PlayersState) => state.players
);

export const selectLoading = createSelector(
    selectPlayersFeature,
    (state: PlayersState) => state.loading
);