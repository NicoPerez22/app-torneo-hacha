import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../app/home/home.module').then(m => m.HomeModule)
      },

      {
        path: 'auth',
        loadChildren: () => import('../app/auth/auth.module').then(m => m.AuthModule)
      },

      {
        path: 'team',
        ...canActivate(() => redirectUnauthorizedTo(['/auth/login'])),
        loadChildren: () => import('../app/team/team.module').then(m => m.TeamModule)
      },

      {
        path: 'profile',
        ...canActivate(() => redirectUnauthorizedTo(['/auth/login'])),
        loadChildren: () => import('../app/profile/profile.module').then(m => m.ProfileModule)
      },

      {
        path: 'search-player',
        ...canActivate(() => redirectUnauthorizedTo(['/auth/login'])),
        loadChildren: () => import('../app/search-players/search.module').then(m => m.SearchModule)
      },
    ]
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ]
})
export class AppRoutingModule { }
