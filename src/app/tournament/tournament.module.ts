import { TournamentCardsComponent } from './view-tournament/components/tournament-cards/tournament-cards.component';
import { TournamentHighlightsComponent } from './view-tournament/components/tournament-highlights/tournament-highlights.component';
import { TournamentKnockoutComponent } from './view-tournament/components/tournament-knockout/tournament-knockout.component';
import { TournamentHeaderComponent } from './view-tournament/components/tournament-header/tournament-header.component';
import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentComponent } from './tournament.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTournamentComponent } from './view-tournament/view-tournament.component';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from './filters/filters.component';
import { InputComponent } from './filters/input/input.component';
import { SelectComponent } from './filters/select/select.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ReportsApprovalComponent } from './reports-approval/reports-approval.component';

@NgModule({
  declarations: [
    TournamentComponent,
    ViewTournamentComponent,
    TournamentCardsComponent,
    TournamentHighlightsComponent,
    TournamentKnockoutComponent,
    TournamentHeaderComponent,
    CreateTournammentComponent,
    FiltersComponent,
    InputComponent,
    SelectComponent,
    ReportsApprovalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TournamentRoutingModule,
    NzSwitchModule,
  ],
})
export class TournamentModule {}
