import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPlayersComponent } from './search-players.component';

const routes: Routes = [
  {
    path: '',
    component: SearchPlayersComponent
  },
]


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class SearchRoutingModule { }
