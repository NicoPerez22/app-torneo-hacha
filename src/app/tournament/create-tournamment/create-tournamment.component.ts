import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TournamentService } from '../service/tournament.service';

@Component({
  selector: 'app-create-tournamment',
  templateUrl: './create-tournamment.component.html',
  styleUrls: ['./create-tournamment.component.css']
})
export class CreateTournammentComponent implements OnInit {

  torneoForm = this.createTorneoForm();
  formatTorneo: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
  ) { }

  ngOnInit(): void {
    this.tournamentService.getFormatoTorneo().subscribe(res => this.formatTorneo = res)
  }

  createTorneoForm(){
    return this.fb.group({
      nombreTorneo: [''],
      formatoTorneo: [0],
      modalidadTorneo: [0],
      cantidadEquipos: [0]
    })
  }

  onSubmitData(){
    console.log(this.torneoForm.value)
  }

}
