import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { MyTeamComponent } from './my-team/my-team.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent,
  },

  {
    path: ':id',
    component: MyTeamComponent,
  },

  {
    path: 'my-team',
    component: MyTeamComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), CommonModule],
})
export class TeamRoutingModule {}
