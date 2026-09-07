import { Component } from '@angular/core';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-market',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-market.component.html',
  styleUrls: ['./dashboard-market.component.css'],
})
export class DashboardMarketComponent {}

