import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tournament-cards',
  templateUrl: './tournament-cards.component.html',
  styleUrls: ['../../view-tournament.component.css'],
  styles: [':host { display: contents; }'],
})
export class TournamentCardsComponent {
  @Input() isLoadingCards = false;
  @Input() cards: any[] = [];
}
