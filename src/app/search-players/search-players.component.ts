import { Component, OnInit, TemplateRef } from '@angular/core';
import { TeamService } from '../service/team.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-search-players',
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css'],
})
export class SearchPlayersComponent implements OnInit {
  playersList: Array<any> = [];
  columns: Array<any> = [];
  players: Array<any> = [];
  myPlayers: Array<any> = [];
  targetTeamPlayers: Array<any> = []; // Jugadores del equipo objetivo
  team;

  player;

  isVisible: boolean = false;
  form: FormGroup;
  user: any;

  // Límite máximo de jugadores seleccionables
  readonly MAX_PLAYERS_SELECTION = 3;

  constructor(
    private teamService: TeamService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router,
    public loginService: LoginService,
    private userSerivce: UserService,
  ) {}

  ngOnInit(): void {
    this._getPlayers();
    this._getProfile(this.loginService.user.id)
  }

  onBird(player): void {
    this._initForm();

    this._getPlayerMyTeam(this.user?.teams[0].id);
    this._getTargetTeamPlayers(player.team.id);

    this.player = player;

    this.isVisible = true;
    this.form.get('playersOut').patchValue([player.id]);
  }

  onSubmit(): void {
    const playersOut = this.form.get('playersOut').value || [];
    const playersIn = this.form.get('playersIn').value || [];

    if (playersOut.length === 0) {
      this.toastrService.warning('Debes seleccionar al menos un jugador entrante', 'Atención');
      return;
    }

    if (playersIn.length === 0) {
      this.toastrService.warning('Debes seleccionar al menos un jugador de salida', 'Atención');
      return;
    }

    this.isVisible = false;

    const dto = {
      fromTeamId: this.loginService.user.idTeam,
      targetPlayerIds: playersOut, // Array de IDs de jugadores entrantes
      offeredPlayerIds: playersIn, // Array de IDs de jugadores ofrecidos
    };

    this.teamService.setBirdTransferPlayer(dto).subscribe({
      next: (resp) => {
        this.toastrService.success('Oferta realizada', 'Éxito');
      },
      error: (err) => {
        this.toastrService.error('Ocurrió un error al realizar la oferta', 'Error');
      },
    });
  }

  onListBird() {
    this.router.navigate(['mercado-transferencias/ofertas']);
  }

  onListBirdAdmin() {
    this.router.navigate(['mercado-transferencias/comprobar-ofertas']);
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // Validar que no se seleccionen más de 3 jugadores entrantes
  onPlayersOutChange(selectedIds: number[]): void {
    if (selectedIds && selectedIds.length > this.MAX_PLAYERS_SELECTION) {
      // Mantener solo los primeros 3
      const limited = selectedIds.slice(0, this.MAX_PLAYERS_SELECTION);
      this.form.get('playersOut').patchValue(limited);
      this.toastrService.warning(`Máximo ${this.MAX_PLAYERS_SELECTION} jugadores entrantes`, 'Atención');
    }
  }

  // Validar que no se seleccionen más de 3 jugadores de salida
  onPlayersInChange(selectedIds: number[]): void {
    if (selectedIds && selectedIds.length > this.MAX_PLAYERS_SELECTION) {
      // Mantener solo los primeros 3
      const limited = selectedIds.slice(0, this.MAX_PLAYERS_SELECTION);
      this.form.get('playersIn').patchValue(limited);
      this.toastrService.warning(`Máximo ${this.MAX_PLAYERS_SELECTION} jugadores de salida`, 'Atención');
    }
  }

  private _getPlayers() {
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.playersList = response.data;
      },
      error: (error) => {
      },
    });
  }

  private _getPlayerMyTeam(id) {
    this.teamService.getTeamByID(id).subscribe({
      next: (resp: any) => {
        this.myPlayers = resp.data.players;
        this.team = resp.data;
      },
    });
  }

  // Obtener jugadores del equipo objetivo para seleccionar múltiples jugadores entrantes
  private _getTargetTeamPlayers(teamId: number) {
    this.teamService.getTeamByID(teamId).subscribe({
      next: (resp: any) => {
        this.targetTeamPlayers = resp.data.players;
      },
    });
  }

  private _getProfile(id) {
    this.userSerivce.getUserByID(id).subscribe({
      next: (resp) => {
        this.user = resp.data.user;
      },
    });
  }

  private _initForm() {
    this.form = this.fb.group({
      playersOut: [[], Validators.required], // Array de jugadores entrantes
      playersIn: [[], Validators.required], // Array de jugadores de salida
    });
  }
}
