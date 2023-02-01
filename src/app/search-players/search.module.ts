import { SearchRoutingModule } from './search-routing.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPlayersComponent } from './search-players.component';



@NgModule({
  declarations: [SearchPlayersComponent],
  imports: [
    CommonModule,
    RouterModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
