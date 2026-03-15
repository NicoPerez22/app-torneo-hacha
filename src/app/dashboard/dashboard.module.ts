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

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardOverviewComponent,
    DashboardTeamsComponent,
    DashboardTournamentsComponent,
    DashboardMarketComponent,
    DashboardReportsComponent,
    DashboardSettingsComponent,
  ],
  imports: [CommonModule, SharedModule, DashboardRoutingModule],
})
export class DashboardModule {}

