import { TeamComponent } from './team.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamRoutingModule } from './team-routing.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTeamComponent } from './my-team/my-team.component';
import { PlayersComponent } from './my-team/players/players.component';
import { ResultsComponent } from './my-team/results/results.component';
import { StadisticsComponent } from './my-team/stadistics/stadistics.component';
import { MatchComponent } from './my-team/match/match.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';

@NgModule({
  declarations: [TeamComponent, MyTeamComponent, PlayersComponent, ResultsComponent, StadisticsComponent, MatchComponent],
  imports: [
    CommonModule,
    TeamRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzCardModule
  ]
})
export class TeamModule { }
