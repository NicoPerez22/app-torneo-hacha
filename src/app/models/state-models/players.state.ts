import { PlayerModel } from './../player.interface';
export interface PlayersState {
    loading: boolean,
    players: ReadonlyArray<PlayerModel>
}