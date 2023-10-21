import { TournamentRoutingModule } from './tournament-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TournamentComponent } from './tournament.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTournamentComponent } from './view-tournament/view-tournament.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { NzStepsModule } from 'ng-zorro-antd/steps';


@NgModule({
  declarations: [TournamentComponent, ViewTournamentComponent, CreateTournammentComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TournamentRoutingModule,
    NzTableModule,
    NzStepsModule
  ]
})
export class TournamentModule { }
