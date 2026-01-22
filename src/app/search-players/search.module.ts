import { SearchRoutingModule } from './search-routing.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPlayersComponent } from './search-players.component';
import { SharedModule } from '../shared/shared.module';
import { TransferSalesComponent } from './transfer-sales/transfer-sales.component';

@NgModule({
  declarations: [SearchPlayersComponent, TransferSalesComponent],
  imports: [CommonModule, RouterModule, SearchRoutingModule, SharedModule],
})
export class SearchModule {}
