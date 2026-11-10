import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tournament-highlights',
  templateUrl: './tournament-highlights.component.html',
  styleUrls: ['../../view-tournament.component.css'],
  styles: [':host { display: contents; }'],
})
export class TournamentHighlightsComponent {
  @Input() isLoadingHighlights = false;
  @Input() highlights: any[] = [];
}
