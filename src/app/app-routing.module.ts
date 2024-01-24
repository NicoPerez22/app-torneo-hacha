import { UserGuard } from './shared/guard/user.guard';
import { TournamentModule } from './tournament/tournament.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const routes: Routes = [
  {
    canActivate: [UserGuard],
    path: 'home',
    loadChildren: () => import('../app/home/home.module').then(m => m.HomeModule)
  },

  {
    path: 'auth',
    loadChildren: () => import('../app/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'team',
    canActivate: [UserGuard],
    loadChildren: () => import('../app/team/team.module').then(m => m.TeamModule)
  },

  {
    path: 'profile',
    canActivate: [UserGuard],
    loadChildren: () => import('../app/profile/profile.module').then(m => m.ProfileModule)
  },

  {
    path: 'search-player',
    loadChildren: () => import('../app/search-players/search.module').then(m => m.SearchModule)
  },

  {
    path: 'tournament',
    canActivate: [UserGuard],
    loadChildren: () => import('../app/tournament/tournament.module').then(m => m.TournamentModule)
  },
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ]
})
export class AppRoutingModule { }
