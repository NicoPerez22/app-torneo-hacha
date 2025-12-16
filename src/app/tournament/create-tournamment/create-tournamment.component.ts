import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TournamentService } from '../service/tournament.service';
import { Router } from '@angular/router';
import { TeamService } from 'src/app/service/team.service';
import { UploadService } from 'src/app/service/upload.service';

@Component({
  selector: 'app-create-tournamment',
  templateUrl: './create-tournamment.component.html',
  styleUrls: ['./create-tournamment.component.css'],
})
export class CreateTournammentComponent implements OnInit {
  form: FormGroup;
  formats: Array<any> = [];
  teams: Array<any> = [];
  cantTeams: Array<any> = [
    { id: 1, value: 8 },
    { id: 2, value: 16 },
    { id: 3, value: 20 },
    { id: 4, value: 32 },
    { id: 5, value: 64 },
  ];

  teamsSelected: Array<any> = [];
  teamsApi: Array<any> = [];
  images: Array<any> = [];
  showSpinner;

  current = 0;
  index = 0;

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private teamService: TeamService,
    private toastrService: ToastrService,
    private router: Router,
    private uploadService: UploadService,
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._getTeams();
    this._getFormats();
  }

  onSubmitData() {
    const obj = {
      name: this.form.get('name').value,
      teamsIds: this.teamsApi,
      draft: this.form.get('draft').value
    };

    this.tournamentService.createTournament(obj).subscribe({
      next: (resp) => {
        if (resp) {
          this.router.navigate(['/tournaments']);
          this.toastrService.success('Torneo creado con exito', 'Exito');
        } else {
          this.toastrService.error('No se pudo crear el torneo', 'Error');
        }
      },
      error: (error) => {
        this.toastrService.error('No se pudo crear el torneo', 'Error');
      },
    });
  }

  onLoadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.showSpinner = true;
    this.uploadService.setImage(file).subscribe({
      next: (resp) => {
        this.images.push(resp);
        this.showSpinner = false;
      },

      error: (err) => {
        console.log(err);
        this.showSpinner = false;
      },
    });
  }

  onSelectTeam(id) {
    const team = this.teams.find((elem) => elem.id === id);
    this.teamsSelected.push(team);
    this.teamsApi.push(id);

    console.log(this.teamsApi);
  }

  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 0;
        break;
      }
      case 1: {
        this.index = 1;
        break;
      }
      case 2: {
        this.index = 2;
        break;
      }
    }
  }

  private _initForm() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      countTeams: [null, Validators.required],
      teams: [null, Validators.required],
      draft: [null, Validators.required]
    });
  }

  private _getTeams() {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp.data;
      },
    });
  }

  private _getFormats() {
    this.tournamentService.getFormats().subscribe({
      next: (resp) => {
        this.formats = resp.data;
      },

      error: () => {},
    });
  }

  // // Crear 32 equipos

  // // Iniciar el sorteo del torneo
  // onClickBtn() {
  //   let teams = Array.from({ length: 32 }, (_, i) => `Equipo ${i + 1}`);

  //   const teamSave = {
  //     idFormat: 1,
  //     teams: teams,
  //     name: "Hacha Pro League",
  //     logo: null
  //   }

  //   this.teamService.createTorneo(teamSave).subscribe(
  //     res => console.log(res)
  //   )

  // }
}
