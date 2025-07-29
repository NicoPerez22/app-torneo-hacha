import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MyTeamComponent } from './my-team/my-team.component';
import { PlayersComponent } from './my-team/players/players.component';
import { ResultsComponent } from './my-team/results/results.component';
import { StadisticsComponent } from './my-team/stadistics/stadistics.component';
import { MatchComponent } from './my-team/match/match.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from '../shared/shared.module';
import { TeamCreateComponent } from './team-create/team-create.component';
import { ManagerComponent } from './my-team/manager/manager.component';

@NgModule({
  declarations: [
    TeamComponent,
    TeamCreateComponent,
    MyTeamComponent,
    PlayersComponent,
    ManagerComponent,
    // ResultsComponent,
    // StadisticsComponent,
    // MatchComponent,
  ],
  imports: [TeamRoutingModule, RouterModule, NzTabsModule, SharedModule],
})
export class TeamModule {}
