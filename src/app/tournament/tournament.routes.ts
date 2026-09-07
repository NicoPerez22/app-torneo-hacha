import { Routes } from '@angular/router';
import { TournamentComponent } from './tournament.component';
import { ViewTournamentComponent } from './view-tournament/view-tournament.component';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { ReportsApprovalComponent } from './reports-approval/reports-approval.component';

export const TOURNAMENT_ROUTES: Routes = [
  { path: '', component: TournamentComponent },
  { path: 'view/:id', component: ViewTournamentComponent },
  { path: 'create', component: CreateTournammentComponent },
  { path: 'comprobar-reportes', component: ReportsApprovalComponent },
];
