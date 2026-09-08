import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { SessionUser } from 'src/app/models/user';
import { LoginService } from 'src/app/service/login.service';
import { TeamService } from 'src/app/service/team.service';
import { UserService } from 'src/app/service/user.service';
import { TeamPlayer, TeamView } from 'src/app/team/models/team';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

type TradeControlName = 'playersOut' | 'playersIn';

interface TradeForm {
  playersOut: FormControl<number[]>;
  playersIn: FormControl<number[]>;
}

@Component({
  selector: 'app-trade',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick()',
  },
})
export class TradeComponent implements OnInit {
  private readonly _modalData = inject<{ player?: TeamPlayer }>(NZ_MODAL_DATA, {
    optional: true,
  });
  private readonly _modalRef = inject(NzModalRef);
  private readonly _teamService = inject(TeamService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _userService = inject(UserService);
  private readonly _toastrService = inject(ToastrService);
  private readonly _loginService = inject(LoginService);

  protected player: TeamPlayer | undefined;
  protected readonly targetTeamPlayers = signal<TeamPlayer[]>([]);
  protected readonly myPlayers = signal<TeamPlayer[]>([]);
  protected readonly team = signal<TeamView | null>(null);
  protected readonly user = signal<SessionUser | null>(null);

  protected readonly form: FormGroup<TradeForm> = this._formBuilder.nonNullable.group({
    playersOut: this._formBuilder.nonNullable.control<number[]>([], {
      validators: [Validators.required],
    }),
    playersIn: this._formBuilder.nonNullable.control<number[]>([], {
      validators: [Validators.required],
    }),
  });

  protected readonly MAX_PLAYERS_SELECTION = 3;
  protected readonly playersOutOpen = signal(false);
  protected readonly playersInOpen = signal(false);
  protected readonly playersOutSearch = signal('');
  protected readonly playersInSearch = signal('');

  protected readonly selectedOutIds = signal<number[]>([]);
  protected readonly selectedInIds = signal<number[]>([]);

  protected readonly filteredOutPlayers = computed(() =>
    this._filterPlayers(this.targetTeamPlayers(), this.playersOutSearch()),
  );
  protected readonly filteredInPlayers = computed(() =>
    this._filterPlayers(this.myPlayers(), this.playersInSearch()),
  );
  protected readonly selectedOutPlayers = computed(() =>
    this._playersByIds(this.targetTeamPlayers(), this.selectedOutIds()),
  );
  protected readonly selectedInPlayers = computed(() =>
    this._playersByIds(this.myPlayers(), this.selectedInIds()),
  );
  protected readonly canConfirm = computed(
    () => this.selectedOutIds().length > 0 && this.selectedInIds().length > 0,
  );

  ngOnInit(): void {
    this.player = this._modalData?.player;
    this._resetMultiSelectUI();

    if (this.player?.id != null) {
      this._patchSelection('playersOut', [this.player.id]);
    }

    this._getProfile(this._loginService.user?.id);

    const targetTeamId = this.player?.team?.id;
    if (targetTeamId != null) {
      this._getTargetTeamPlayers(targetTeamId);
    }
  }

  protected onDocumentClick(): void {
    this.playersOutOpen.set(false);
    this.playersInOpen.set(false);
  }

  protected onCancel(): void {
    this._resetMultiSelectUI();
    this._modalRef.destroy();
  }

  protected onSubmit(): void {
    const playersOut = this.selectedOutIds();
    const playersIn = this.selectedInIds();

    if (playersOut.length === 0) {
      this._toastrService.warning(
        'Debes seleccionar al menos un jugador entrante',
        'Atención',
      );
      return;
    }

    if (playersIn.length === 0) {
      this._toastrService.warning(
        'Debes seleccionar al menos un jugador de salida',
        'Atención',
      );
      return;
    }

    const fromTeamId = this.user()?.teams?.[0]?.id;
    if (!fromTeamId) {
      this._toastrService.error(
        'No se pudo determinar tu equipo para realizar la oferta',
        'Error',
      );
      return;
    }

    this._teamService
      .setBirdTransferPlayer({
        fromTeamId,
        targetPlayerIds: playersOut,
        offeredPlayerIds: playersIn,
      })
      .subscribe({
        next: () => {
          this._toastrService.success('Oferta realizada', 'Éxito');
          this._resetMultiSelectUI();
          this._modalRef.close({ ok: true });
        },
        error: () => {
          this._toastrService.error(
            'Ocurrió un error al realizar la oferta',
            'Error',
          );
        },
      });
  }

  protected onTogglePlayersOutOpen(event: Event): void {
    event.stopPropagation();
    this.playersOutOpen.update((open) => !open);
    if (this.playersOutOpen()) {
      this.playersInOpen.set(false);
    }
  }

  protected onTogglePlayersInOpen(event: Event): void {
    event.stopPropagation();
    this.playersInOpen.update((open) => !open);
    if (this.playersInOpen()) {
      this.playersOutOpen.set(false);
    }
  }

  protected onStopPropagation(event: Event): void {
    event.stopPropagation();
  }

  protected onPlayersOutSearch(event: Event): void {
    this.playersOutSearch.set((event.target as HTMLInputElement).value);
  }

  protected onPlayersInSearch(event: Event): void {
    this.playersInSearch.set((event.target as HTMLInputElement).value);
  }

  protected isSelected(controlName: TradeControlName, id: number): boolean {
    const ids =
      controlName === 'playersOut'
        ? this.selectedOutIds()
        : this.selectedInIds();
    return ids.includes(id);
  }

  protected onToggleSelected(
    controlName: TradeControlName,
    id: number,
    event?: Event,
  ): void {
    event?.stopPropagation();
    const current =
      controlName === 'playersOut'
        ? [...this.selectedOutIds()]
        : [...this.selectedInIds()];
    const index = current.indexOf(id);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this._limitAndPatch(controlName, current);
  }

  protected onRemoveSelected(
    controlName: TradeControlName,
    id: number,
    event?: Event,
  ): void {
    event?.stopPropagation();
    const current =
      controlName === 'playersOut'
        ? this.selectedOutIds()
        : this.selectedInIds();
    this._patchSelection(
      controlName,
      current.filter((value) => value !== id),
    );
  }

  protected playerLabel(player: TeamPlayer | undefined): string {
    if (!player) {
      return '';
    }
    return `${player.name ?? ''} ${player.lastName ?? ''} (${player.position ?? ''}) - ${player.valoration ?? ''}`.trim();
  }

  private _limitAndPatch(controlName: TradeControlName, selectedIds: number[]): void {
    let next = selectedIds;
    if (selectedIds.length > this.MAX_PLAYERS_SELECTION) {
      next = selectedIds.slice(0, this.MAX_PLAYERS_SELECTION);
      this._toastrService.warning(
        `Máximo ${this.MAX_PLAYERS_SELECTION} jugadores`,
        'Atención',
      );
    }
    this._patchSelection(controlName, next);
  }

  private _patchSelection(controlName: TradeControlName, ids: number[]): void {
    this.form.controls[controlName].patchValue(ids);
    if (controlName === 'playersOut') {
      this.selectedOutIds.set(ids);
    } else {
      this.selectedInIds.set(ids);
    }
  }

  private _filterPlayers(list: TeamPlayer[], query: string): TeamPlayer[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return list;
    }
    return list.filter((player) => {
      const text =
        `${player.name ?? ''} ${player.lastName ?? ''} ${player.position ?? ''} ${player.valoration ?? ''}`.toLowerCase();
      return text.includes(normalized);
    });
  }

  private _playersByIds(list: TeamPlayer[], ids: number[]): TeamPlayer[] {
    return ids
      .map((id) => list.find((player) => player.id === id))
      .filter((player): player is TeamPlayer => !!player);
  }

  private _getPlayerMyTeam(id: number): void {
    this._teamService.getTeamByID(id).subscribe({
      next: (resp) => {
        this.myPlayers.set(resp?.data?.players ?? []);
        this.team.set(resp?.data ?? null);
      },
    });
  }

  private _getTargetTeamPlayers(teamId: number): void {
    this._teamService.getTeamByID(teamId).subscribe({
      next: (resp) => {
        this.targetTeamPlayers.set(resp?.data?.players ?? []);
      },
    });
  }

  private _getProfile(id: number | undefined): void {
    if (!id) {
      return;
    }
    this._userService.getUserByID(id).subscribe({
      next: (resp) => {
        const profile = resp?.data?.user ?? null;
        this.user.set(profile);
        const myTeamId = profile?.teams?.[0]?.id;
        if (myTeamId) {
          this._getPlayerMyTeam(myTeamId);
        }
      },
    });
  }

  private _resetMultiSelectUI(): void {
    this.playersOutOpen.set(false);
    this.playersInOpen.set(false);
    this.playersOutSearch.set('');
    this.playersInSearch.set('');
  }
}
