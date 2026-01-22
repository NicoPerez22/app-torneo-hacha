import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPlayersComponent } from './search-players.component';
import { TransferSalesComponent } from './transfer-sales/transfer-sales.component';

const routes: Routes = [
  {
    path: '',
    component: SearchPlayersComponent
  },
  {
    path: 'ofertas',
    component: TransferSalesComponent
  },
  {
    path: 'comprobar-ofertas',
    component: TransferSalesComponent,
    data: { isAdmin: true }
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
