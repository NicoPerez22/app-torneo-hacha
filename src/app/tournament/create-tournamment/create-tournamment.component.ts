import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TournamentService } from '../service/tournament.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-tournamment',
  templateUrl: './create-tournamment.component.html',
  styleUrls: ['./create-tournamment.component.css'],
})
export class CreateTournammentComponent implements OnInit {
  torneoForm: FormGroup;
  formatTorneo: Array<any> = [];
  teams: Array<any> = [];
  teamsSelected: Array<any> = [];
  teamsApi: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._initForm()

    this.tournamentService
      .getFormatoTorneo()
      .subscribe((res) => (this.formatTorneo = res));

    this.tournamentService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private _initForm() {
    this.torneoForm = this.fb.group({
      name: [null],
      teams: [0],
    });
  }

  onSubmitData() {
    const obj = {
      name: this.torneoForm.get('name').value,
      teamsIds: this.teamsApi,
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

  onSelectTeam(id) {
    const team = this.teams.find((elem) => elem.id === id);
    this.teamsSelected.push(team);
    this.teamsApi.push(id)
  }
}
