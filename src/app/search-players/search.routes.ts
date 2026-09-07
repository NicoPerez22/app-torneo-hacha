import { Routes } from '@angular/router';
import { SearchPlayersComponent } from './search-players.component';
import { TransferSalesComponent } from './transfer-sales/transfer-sales.component';

export const SEARCH_ROUTES: Routes = [
  { path: '', component: SearchPlayersComponent },
  { path: 'ofertas', component: TransferSalesComponent },
  {
    path: 'comprobar-ofertas',
    component: TransferSalesComponent,
    data: { isAdmin: true },
  },
];
