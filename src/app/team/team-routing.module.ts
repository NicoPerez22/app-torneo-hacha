import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { MyTeamComponent } from './my-team/my-team.component';

const routes: Routes = [
  {
    path: 'create-team',
    component: TeamComponent
  },

  {
    path: 'my-team',
    component: MyTeamComponent
  }
]


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class TeamRoutingModule { }
