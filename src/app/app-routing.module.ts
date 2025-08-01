import { UserGuard } from './shared/guard/user.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    canActivate: [UserGuard],
    path: 'home',
    loadChildren: () =>
      import('../app/home/home.module').then((m) => m.HomeModule),
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('../app/auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'equipos',
    canActivate: [UserGuard],
    loadChildren: () =>
      import('../app/team/team.module').then((m) => m.TeamModule),
  },

  {
    path: 'profile',
    canActivate: [UserGuard],
    loadChildren: () =>
      import('../app/profile/profile.module').then((m) => m.ProfileModule),
  },

  {
    path: 'mercado-transferencias',
    canActivate: [UserGuard],
    loadChildren: () =>
      import('../app/search-players/search.module').then((m) => m.SearchModule),
  },

  {
    path: 'tournament',
    canActivate: [UserGuard],
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
