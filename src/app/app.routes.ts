import { Routes } from '@angular/router';
import { userGuard } from './shared/guard/user.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'home',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'equipos',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./team/team.routes').then((m) => m.TEAM_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'mercado-transferencias',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./search-players/search.routes').then((m) => m.SEARCH_ROUTES),
  },
  {
    path: 'inhabilitados',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./disabled-players/disabled-players.routes').then(
        (m) => m.DISABLED_PLAYERS_ROUTES,
      ),
  },
  {
    path: 'tournament',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./tournament/tournament.routes').then((m) => m.TOURNAMENT_ROUTES),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
