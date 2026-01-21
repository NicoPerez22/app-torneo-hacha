import { TeamCountOption } from '../models/tournament.interface';

export const TOURNAMENT_CONSTANTS = {
  SPINNER_DELAY_MS: 1000,
  DEFAULT_LOGO_PATH: '../../assets/images/HYT-IESA.png',
  DEFAULT_PLAYER_IMAGE: '../../../assets/images/player-default.png',
  MAX_TEAMS_REACHED_MESSAGE: 'Ya seleccionaste el maximo de equipos',
  TOURNAMENT_CREATED_SUCCESS: 'Torneo creado con exito',
  TOURNAMENT_CREATE_ERROR: 'No se pudo crear el torneo',
  TOURNAMENTS_LOAD_ERROR: 'No se pudo cargar los torneos',
  ERROR_TITLE: 'Error',
  SUCCESS_TITLE: 'Exito',
  ATTENTION_TITLE: 'Atencion',
  ERROR_OCCURRED: 'Ocurrio un error',
} as const;

export const TEAM_COUNT_OPTIONS: TeamCountOption[] = [
  { id: 1, value: 8 },
  { id: 2, value: 16 },
  { id: 3, value: 20 },
  { id: 4, value: 32 },
  { id: 5, value: 64 },
];

export const CREATE_TOURNAMENT_STEPS = {
  TOURNAMENT_DATA: 0,
  TEAMS: 1,
} as const;
