import { Component } from '@angular/core';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-settings',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-settings.component.html',
  styleUrls: ['./dashboard-settings.component.css'],
})
export class DashboardSettingsComponent {}

