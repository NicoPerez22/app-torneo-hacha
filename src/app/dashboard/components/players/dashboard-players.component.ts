import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TeamService } from 'src/app/service/team.service';
import { DashboardPlayersService } from '../../service/dashboard-players.service';
import { DashboardPlayer, PlayerFormValue, PlayerTeam } from './dashboard-player.interface';

@Component({
  selector: 'app-dashboard-players',
  templateUrl: './dashboard-players.component.html',
  styleUrls: ['./dashboard-players.component.css'],
})
export class DashboardPlayersComponent implements OnInit, OnDestroy {
  readonly positions = ['POR', 'LD', 'LI', 'DFC', 'DFD', 'DFI', 'MCD', 'MC', 'MCO', 'MD', 'MI', 'ED', 'EI', 'SD', 'DC'];
  readonly pageSize = 15;
  readonly paginationId = 'dashboard-players';
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    position: ['', Validators.required],
    valoration: [70, [Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(/^\d+$/)]],
    photo: ['', [Validators.pattern(/^https?:\/\/[^\s]+$/)]],
    isHabilitado: [true],
    teamId: [null as number | null, Validators.required],
  });
  players: DashboardPlayer[] = [];
  teams: PlayerTeam[] = [];
  loading = false;
  saving = false;
  loadError = '';
  saveError = '';
  editorOpen = false;
  editingId: number | null = null;
  deletingId: number | null = null;
  search = '';
  teamFilter = '';
  page = 1;
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly playersService: DashboardPlayersService,
    private readonly teamService: TeamService,
    private readonly toastr: ToastrService,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get filteredPlayers(): DashboardPlayer[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.players.filter(player =>
      (!query || (player.name + ' ' + player.lastName).toLocaleLowerCase().includes(query)) &&
      (!this.teamFilter ||
        (this.teamFilter === 'unassigned' ? !player.team : String(player.team?.id) === this.teamFilter)),
    );
  }

  reload(): void {
    if (this.loading) return;
    this.loading = true;
    this.loadError = '';
    forkJoin({
      players: this.playersService.getPlayers(),
      teams: this.teamService.getTeams(),
    }).pipe(takeUntil(this.destroyed$), finalize(() => this.loading = false)).subscribe({
      next: ({ players, teams }) => {
        if (teams?.httpCode >= 400) {
          this.loadError = 'No se pudieron cargar los equipos. Volvé a intentar.';
          return;
        }
        this.players = players;
        this.teams = teams?.data ?? [];
        this.page = 1;
      },
      error: () => this.loadError = 'No se pudieron cargar los jugadores y equipos. Volvé a intentar.',
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ name: '', lastName: '', position: '', valoration: 70, photo: '', isHabilitado: true, teamId: null });
    this.saveError = '';
    this.editorOpen = true;
  }

  openEdit(player: DashboardPlayer): void {
    this.editingId = player.id;
    this.form.reset({
      name: player.name,
      lastName: player.lastName,
      position: player.position,
      valoration: player.valoration,
      photo: this.photoUrl(player, ''),
      isHabilitado: !!player.isHabilitado,
      teamId: player.team?.id ?? null,
    });
    this.saveError = '';
    this.editorOpen = true;
  }

  closeEditor(): void {
    if (this.saving) return;
    this.editorOpen = false;
    this.saveError = '';
  }

  save(): void {
    if (this.saving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const value: PlayerFormValue = {
      ...raw,
      name: raw.name.trim(),
      lastName: raw.lastName.trim(),
      photo: raw.photo.trim(),
      valoration: Number(raw.valoration),
      teamId: Number(raw.teamId),
    };
    if (!this.teams.some(team => team.id === value.teamId)) {
      this.saveError = 'Seleccioná un equipo disponible.';
      return;
    }
    this.saving = true;
    this.saveError = '';
    const request = this.editingId === null
      ? this.playersService.createPlayer(value)
      : this.playersService.updatePlayer(this.editingId, value);
    request.pipe(takeUntil(this.destroyed$), finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.toastr.success(this.editingId === null ? 'Jugador creado con éxito' : 'Jugador actualizado con éxito');
        this.editorOpen = false;
        this.reload();
      },
      error: () => {
        this.saveError = 'No se pudo guardar el jugador. Revisá los datos e intentá de nuevo.';
      },
    });
  }

  confirmDelete(player: DashboardPlayer): void {
    if (this.deletingId !== null || this.saving) return;
    this.modal.confirm({
      nzTitle: 'Eliminar jugador',
      nzContent: '¿Querés eliminar este jugador? Se quitará del listado y de su equipo.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.deletePlayer(player),
    });
  }

  private deletePlayer(player: DashboardPlayer): Promise<boolean> {
    this.deletingId = player.id;
    return new Promise(resolve => {
      this.playersService.deletePlayer(player.id).pipe(
        takeUntil(this.destroyed$),
        finalize(() => { this.deletingId = null; resolve(false); }),
      ).subscribe({
        next: () => {
          this.players = this.players.filter(item => item.id !== player.id);
          this.page = Math.min(this.page, Math.max(1, Math.ceil(this.filteredPlayers.length / this.pageSize)));
          this.toastr.success('Jugador eliminado con éxito');
          resolve(true);
        },
        error: () => {
          this.toastr.error('No se pudo eliminar el jugador. Intentá nuevamente.');
          resolve(false);
        },
      });
    });
  }

  photoUrl(player: DashboardPlayer, fallback = 'assets/images/player-default.png'): string {
    return typeof player.photo === 'string'
      ? player.photo || fallback
      : player.photo?.secureUrl || player.photo?.url || fallback;
  }

  trackByPlayerId(_: number, player: DashboardPlayer): number {
    return player.id;
  }
}