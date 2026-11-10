import { Component, Input } from '@angular/core';
import { Tournament } from '../../../models/tournament.interface';

@Component({
  selector: 'app-tournament-header',
  templateUrl: './tournament-header.component.html',
  styleUrls: ['../../view-tournament.component.css'],
  styles: [':host { display: contents; }'],
})
export class TournamentHeaderComponent {
  @Input() tournament?: Tournament;
}
