import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DisabledPlayersComponent } from './disabled-players.component';

const routes: Routes = [
  {
    path: '',
    component: DisabledPlayersComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), CommonModule],
})
export class DisabledPlayersRoutingModule { }
