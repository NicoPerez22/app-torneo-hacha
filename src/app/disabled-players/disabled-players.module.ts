import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisabledPlayersComponent } from './disabled-players.component';
import { DisabledPlayersRoutingModule } from './disabled-players-routing.module';



@NgModule({
  declarations: [
    DisabledPlayersComponent
  ],
  imports: [
    CommonModule,
    DisabledPlayersRoutingModule
  ]
})
export class DisabledPlayersModule { }
