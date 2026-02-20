import { ViewTournamentComponent } from './view-tournament/view-tournament.component';
import { TournamentComponent } from './tournament.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { ReportsApprovalComponent } from './reports-approval/reports-approval.component';

const routes: Routes = [
  {
    path: '',
    component: TournamentComponent
  },

  {
    path: 'view/:id',
    component: ViewTournamentComponent
  },

  {
    path: 'create',
    component: CreateTournammentComponent
  },

  {
    path: 'comprobar-reportes',
    component: ReportsApprovalComponent,
  },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class TournamentRoutingModule { }
