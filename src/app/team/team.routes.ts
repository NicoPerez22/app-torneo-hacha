import { Routes } from '@angular/router';
import { TeamComponent } from './team.component';
import { MyTeamComponent } from './my-team/my-team.component';

export const TEAM_ROUTES: Routes = [
  { path: '', component: TeamComponent },
  { path: ':id', component: MyTeamComponent },
  { path: 'my-team', component: MyTeamComponent },
];
