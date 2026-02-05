import { Component, OnInit, TemplateRef } from '@angular/core';
import { TeamService } from '../service/team.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  team
  user

  player;

  isVisible: boolean = false;
  form: FormGroup;

  constructor(
    private teamService: TeamService,
    private spinnerService: NgxSpinnerService,
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

    this._getPlayerMyTeam(this.user.teams[0].id);

    this.player = player;

    this.isVisible = true;
    this.form.get('playerOut').patchValue(player?.fullName);
    this.form.get('playerOut').disable();
  }

  onSubmit(): void {
    this.isVisible = false;

    const dto = {
      fromTeamId: this.loginService.user.idTeam,
      targetPlayerId: this.player.id,
      offeredPlayerId: this.form.get('playerIn').value,
    }

    this.teamService.setBirdTransferPlayer(dto).subscribe({
      next: (resp) => {
        this.toastrService.success('Oferta realizada', 'Exito');
      },
      error: (err) => {
        this.toastrService.error('Ocurrio un error al realizar la oferta', 'Error');
      }
    })
  }

  onListBird(){
    this.router.navigate(['mercado-transferencias/ofertas'])
  }

  onListBirdAdmin(){
    this.router.navigate(['mercado-transferencias/comprobar-ofertas'])
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  private _getPlayers() {
    this.spinnerService.show();
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.playersList = response.data;
      },
      error: (error) => {
        this.spinnerService.hide();
      },
    });
  }

  private _getPlayerMyTeam(id) {
    this.teamService.getTeamByID(id).subscribe({
      next: (resp: any) => {
        this.myPlayers = resp.data.players;
        this.team = resp.data
      }
    })
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
      playerOut: [null],
      playerIn: [null],
    });
  }
}
