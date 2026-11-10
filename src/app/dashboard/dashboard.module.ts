import { DashboardUsersComponent } from './components/users/dashboard-users.component';
import { DashboardPlayersComponent } from './components/players/dashboard-players.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMarketComponent } from './components/market/dashboard-market.component';
import { DashboardOverviewComponent } from './components/overview/dashboard-overview.component';
import { DashboardReportsComponent } from './components/reports/dashboard-reports.component';
import { DashboardSettingsComponent } from './components/settings/dashboard-settings.component';
import { DashboardTeamsComponent } from './components/teams/dashboard-teams.component';
import { DashboardTournamentsComponent } from './components/tournaments/dashboard-tournaments.component';
import { TournamentRoundsComponent } from './components/tournaments/tournament-rounds.component';
import { TournamentScheduleComponent } from './components/tournaments/tournament-schedule.component';
import { AddWeekDateModalComponent } from './components/tournaments/add-week-date-modal.component';
import { CreateSeasonWeekModalComponent } from './components/tournaments/create-season-week-modal.component';
import { TeamModule } from '../team/team.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardOverviewComponent,
    DashboardTeamsComponent,
    DashboardPlayersComponent,
    DashboardUsersComponent,
    DashboardTournamentsComponent,
    TournamentRoundsComponent,
    TournamentScheduleComponent,
    AddWeekDateModalComponent,
    CreateSeasonWeekModalComponent,
    DashboardMarketComponent,
    DashboardReportsComponent,
    DashboardSettingsComponent,
  ],
  imports: [CommonModule, SharedModule, DashboardRoutingModule, TeamModule],
})
export class DashboardModule {}

