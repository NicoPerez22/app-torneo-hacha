import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { userGuard } from './shared/guard/user.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('../app/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'equipos',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/team/team.module').then((m) => m.TeamModule),
  },
  {
    path: 'profile',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'mercado-transferencias',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/search-players/search.module').then((m) => m.SearchModule),
  },
  {
    path: 'inhabilitados',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/disabled-players/disabled-players.module').then(
        (m) => m.DisabledPlayersModule,
      ),
  },
  {
    path: 'tournament',
    canActivate: [userGuard],
    loadChildren: () =>
      import('../app/tournament/tournament.module').then(
        (m) => m.TournamentModule,
      ),
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
})
export class AppRoutingModule {}
