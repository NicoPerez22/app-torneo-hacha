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

@NgModule({
  declarations: [
    TournamentComponent,
    ViewTournamentComponent,
    CreateTournammentComponent,
    FiltersComponent,
    InputComponent,
    SelectComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TournamentRoutingModule,
    NzSwitchModule,
  ],
})
export class TournamentModule {}
