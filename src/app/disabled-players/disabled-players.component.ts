import { Component, inject, OnInit, signal } from '@angular/core';
import {
  DisabledPlayerDto,
  DisabledPlayersService,
} from './service/disabled-players.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-disabled-players',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './disabled-players.component.html',
  styleUrls: ['./disabled-players.component.css'],
})
export class DisabledPlayersComponent implements OnInit {
  private readonly disabledPlayersService = inject(DisabledPlayersService);
  protected readonly teams = signal<DisabledPlayerDto[]>([]);

  ngOnInit(): void {
    this.getInjuryPlayers();
  }

  private getInjuryPlayers(): void {
    this.disabledPlayersService.getInjuryPlayers().subscribe({
      next: (resp) => {
        this.teams.set(resp.data ?? []);
      },
    });
  }
}
