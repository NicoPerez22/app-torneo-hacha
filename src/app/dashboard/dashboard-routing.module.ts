import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardMarketComponent } from './components/market/dashboard-market.component';
import { DashboardOverviewComponent } from './components/overview/dashboard-overview.component';
import { DashboardReportsComponent } from './components/reports/dashboard-reports.component';
import { DashboardSettingsComponent } from './components/settings/dashboard-settings.component';
import { DashboardTeamsComponent } from './components/teams/dashboard-teams.component';
import { DashboardTournamentsComponent } from './components/tournaments/dashboard-tournaments.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: DashboardOverviewComponent },
      { path: 'teams', component: DashboardTeamsComponent },
      { path: 'tournaments', component: DashboardTournamentsComponent },
      { path: 'market', component: DashboardMarketComponent },
      { path: 'reports', component: DashboardReportsComponent },
      { path: 'settings', component: DashboardSettingsComponent },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

