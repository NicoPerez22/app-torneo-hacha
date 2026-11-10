import { Component, Input } from '@angular/core';
import { Match } from '../../../models/round.interface';

@Component({
  selector: 'app-tournament-knockout',
  templateUrl: './tournament-knockout.component.html',
  styleUrls: ['../../view-tournament.component.css'],
  styles: [':host { display: contents; }'],
})
export class TournamentKnockoutComponent {
  @Input() isLoadingKnockoutStages = false;
  @Input() knockoutStages: { title: string; matches: Match[] }[] = [];
}
