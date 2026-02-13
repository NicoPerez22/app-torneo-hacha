import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/service/login.service';
import { TeamService } from 'src/app/service/team.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
})
export class TradeComponent implements OnInit {
  // Se setea desde NzModalService.create({ nzComponentParams })
  player: any;

  targetTeamPlayers: Array<any> = []; // Jugadores del equipo objetivo (entrantes)
  myPlayers: Array<any> = []; // Jugadores de mi equipo (salientes)
  team: any; // Mi equipo
  user: any;

  form: FormGroup;

  // Límite máximo de jugadores seleccionables
  readonly MAX_PLAYERS_SELECTION = 3;

  // "Bootstrap style" multiselect dropdown state
  playersOutOpen = false;
  playersInOpen = false;
  playersOutSearch = '';
  playersInSearch = '';

  constructor(
    private readonly modalRef: NzModalRef,
    private readonly teamService: TeamService,
    private readonly fb: FormBuilder,
    private readonly userSerivce: UserService,
    private readonly toastrService: ToastrService,
    public readonly loginService: LoginService,
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._resetMultiSelectUI();

    // Precargar jugador entrante principal (el que se clickeó)
    if (this.player?.id != null) {
      this.form.get('playersOut')?.patchValue([this.player.id]);
    }

    // Cargar data necesaria para el modal
    this._getProfile(this.loginService?.user?.id);

    // Target team players (equipo dueño del jugador objetivo)
    const targetTeamId = this.player?.team?.id;
    if (targetTeamId != null) {
      this._getTargetTeamPlayers(targetTeamId);
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    // Close dropdowns when clicking outside
    this.playersOutOpen = false;
    this.playersInOpen = false;
  }

  handleCancel(): void {
    this._resetMultiSelectUI();
    this.modalRef.destroy();
  }

  onSubmit(): void {
    const playersOut = this.form.get('playersOut')?.value || [];
    const playersIn = this.form.get('playersIn')?.value || [];

    if (playersOut.length === 0) {
      this.toastrService.warning(
        'Debes seleccionar al menos un jugador entrante',
        'Atención',
      );
      return;
    }

    if (playersIn.length === 0) {
      this.toastrService.warning(
        'Debes seleccionar al menos un jugador de salida',
        'Atención',
      );
      return;
    }

    const fromTeamId = this.user?.teams?.[0]?.id;
    if (!fromTeamId) {
      this.toastrService.error(
        'No se pudo determinar tu equipo para realizar la oferta',
        'Error',
      );
      return;
    }

    const dto = {
      fromTeamId,
      targetPlayerIds: playersOut, // Array de IDs de jugadores entrantes
      offeredPlayerIds: playersIn, // Array de IDs de jugadores ofrecidos
    };

    this.teamService.setBirdTransferPlayer(dto).subscribe({
      next: () => {
        this.toastrService.success('Oferta realizada', 'Éxito');
        this._resetMultiSelectUI();
        this.modalRef.close({ ok: true });
      },
      error: () => {
        this.toastrService.error(
          'Ocurrió un error al realizar la oferta',
          'Error',
        );
      },
    });
  }

  // Validar que no se seleccionen más de 3 jugadores entrantes
  onPlayersOutChange(selectedIds: number[]): void {
    if (selectedIds && selectedIds.length > this.MAX_PLAYERS_SELECTION) {
      // Mantener solo los primeros 3
      const limited = selectedIds.slice(0, this.MAX_PLAYERS_SELECTION);
      this.form.get('playersOut')?.patchValue(limited);
      this.toastrService.warning(
        `Máximo ${this.MAX_PLAYERS_SELECTION} jugadores entrantes`,
        'Atención',
      );
    }
  }

  // Validar que no se seleccionen más de 3 jugadores de salida
  onPlayersInChange(selectedIds: number[]): void {
    if (selectedIds && selectedIds.length > this.MAX_PLAYERS_SELECTION) {
      // Mantener solo los primeros 3
      const limited = selectedIds.slice(0, this.MAX_PLAYERS_SELECTION);
      this.form.get('playersIn')?.patchValue(limited);
      this.toastrService.warning(
        `Máximo ${this.MAX_PLAYERS_SELECTION} jugadores de salida`,
        'Atención',
      );
    }
  }

  // ----- Bootstrap-style multiselect helpers -----
  togglePlayersOutOpen(ev: Event) {
    ev.stopPropagation();
    this.playersOutOpen = !this.playersOutOpen;
    if (this.playersOutOpen) this.playersInOpen = false;
  }

  togglePlayersInOpen(ev: Event) {
    ev.stopPropagation();
    this.playersInOpen = !this.playersInOpen;
    if (this.playersInOpen) this.playersOutOpen = false;
  }

  stopPropagation(ev: Event) {
    ev.stopPropagation();
  }

  isSelected(controlName: 'playersOut' | 'playersIn', id: number): boolean {
    const value = (this.form?.get(controlName)?.value ?? []) as number[];
    return Array.isArray(value) && value.includes(id);
  }

  toggleSelected(
    controlName: 'playersOut' | 'playersIn',
    id: number,
    ev?: Event,
  ) {
    ev?.stopPropagation();
    const control = this.form.get(controlName);
    const value = (control.value ?? []) as number[];
    const next = Array.isArray(value) ? [...value] : [];
    const idx = next.indexOf(id);

    if (idx >= 0) {
      next.splice(idx, 1);
    } else {
      next.push(id);
    }

    if (controlName === 'playersOut') this.onPlayersOutChange(next);
    if (controlName === 'playersIn') this.onPlayersInChange(next);
    control.patchValue(next);
  }

  removeSelected(
    controlName: 'playersOut' | 'playersIn',
    id: number,
    ev?: Event,
  ) {
    ev?.stopPropagation();
    const control = this.form.get(controlName);
    const value = (control.value ?? []) as number[];
    const next = (Array.isArray(value) ? value : []).filter((x) => x !== id);
    control.patchValue(next);
  }

  getFilteredOptions(controlName: 'playersOut' | 'playersIn'): any[] {
    const list =
      controlName === 'playersOut' ? this.targetTeamPlayers : this.myPlayers;
    const q = (
      controlName === 'playersOut' ? this.playersOutSearch : this.playersInSearch
    )
      .trim()
      .toLowerCase();
    if (!q) return list ?? [];
    return (list ?? []).filter((p) => {
      const text =
        `${p?.name ?? ''} ${p?.lastName ?? ''} ${p?.position ?? ''} ${p?.valoration ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  }

  getLabel(p: any): string {
    if (!p) return '';
    return `${p?.name ?? ''} ${p?.lastName ?? ''} (${p?.position ?? ''}) - ${p?.valoration ?? ''}`.trim();
  }

  findById(
    controlName: 'playersOut' | 'playersIn',
    id: number,
  ): any | undefined {
    const list =
      controlName === 'playersOut' ? this.targetTeamPlayers : this.myPlayers;
    return (list ?? []).find((x) => x?.id === id);
  }

  private _getPlayerMyTeam(id: any) {
    if (!id) return;
    this.teamService.getTeamByID(id).subscribe({
      next: (resp: any) => {
        this.myPlayers = resp?.data?.players ?? [];
        this.team = resp?.data;
      },
    });
  }

  // Obtener jugadores del equipo objetivo para seleccionar múltiples jugadores entrantes
  private _getTargetTeamPlayers(teamId: any) {
    if (!teamId) return;
    this.teamService.getTeamByID(teamId).subscribe({
      next: (resp: any) => {
        this.targetTeamPlayers = resp?.data?.players ?? [];
      },
    });
  }

  private _getProfile(id: any) {
    if (!id) return;
    this.userSerivce.getUserByID(id).subscribe({
      next: (resp) => {
        this.user = resp?.data?.user;
        const myTeamId = this.user?.teams?.[0]?.id;
        if (myTeamId) {
          this._getPlayerMyTeam(myTeamId);
        }
      },
    });
  }

  private _initForm() {
    this.form = this.fb.group({
      playersOut: [[], Validators.required], // Array de jugadores entrantes
      playersIn: [[], Validators.required], // Array de jugadores de salida
    });
  }

  private _resetMultiSelectUI() {
    this.playersOutOpen = false;
    this.playersInOpen = false;
    this.playersOutSearch = '';
    this.playersInSearch = '';
  }
}
