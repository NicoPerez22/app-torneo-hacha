import { Component, OnInit } from '@angular/core';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-stadistics',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './stadistics.component.html',
  styleUrls: ['./stadistics.component.css']
})
export class StadisticsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
