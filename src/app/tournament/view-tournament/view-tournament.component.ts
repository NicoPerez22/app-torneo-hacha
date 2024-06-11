import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../service/tournament.service';

@Component({
  selector: 'app-view-tournament',
  templateUrl: './view-tournament.component.html',
  styleUrls: ['./view-tournament.component.css']
})
export class ViewTournamentComponent implements OnInit {

  teamList: Array<any> = []
  listaMatch: Array<any> = [];
  gamesList = [
    { id: 1, name: "FIFA" },
    { id: 2, name: "F1" },
    { id: 2, name: "CSGO" },
  ];

  listaEquipos = [
    { id: 1, name: "HACHA Y TIZA ESPORTS", logo: '../../assets/images/HYT-IESA.png' },
    { id: 2, name: "AESMA GAMING", logo: '../../assets/images/logo 1.png' },
    { id: 3, name: "GIMNASIA ESPORTS", logo: '../../assets/images/GELP.png' },
    { id: 4, name: "HYT ESPORTS", logo: '../../assets/images/logo 2.png' },
  ]

  tournament
  id

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService
  ){ }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.id = +params.id
    })

    this.tournamentService.getTournamentByID(this.id)
    .subscribe({
      next:(resp) => {
        this.tournament = resp
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  formatoLiga(){
    let listaFormato = [
      { id: 1, name: "LIGA" },
      { id: 2, name: "ELIMINATORIAS" },
      { id: 2, name: "FASE DE GRUPO" },
    ]

    let listaEquipos = [
      { id: 1, name: "HACHA Y TIZA ESPORTS" },
      { id: 2, name: "AESMA GAMING" },
      { id: 3, name: "GIMNASIA ESPORTS" },
      { id: 4, name: "HYT ESPORTS" },
    ]

    let listaRandom = [];

    //ORDENA LOS EQUIPOS EN NUEVO ARRAY DE FORMA RANDOM
    while(listaEquipos.length > 0){
      const random = Math.floor(Math.random() * listaEquipos.length);
      const equipo = listaEquipos[random];

      listaRandom.push(equipo);
      listaEquipos.splice(random, 1)
    }
    
    //EL EQUIPO AL AZAR SELECCIONADO, ENFRENTARLO CON LOS EQUIPOS RESTANTES
    for (let index = 0; index < listaRandom.length; index++) {
      const equipo = listaRandom[index];
      listaRandom.map((e) => {
        if(equipo.id !== e.id){
          const match = {
            id: 0,
            equipo1: equipo,
            equipo2: e
          }
          
          this.listaMatch.push(match)
        }
      })
    }

    //ELIMINA LOS ENFRENTAMIENTOS DOBLES
    for (let index = 0; index <= 6; index++) {
      this.listaMatch.splice(index, 1)      
    }

    console.log(this.listaMatch)
  }

  formatoEliminatoria(){
    let listaEquipos = [
      { id: 1, name: "HACHA Y TIZA ESPORTS" },
      { id: 2, name: "AESMA GAMING" },
      { id: 3, name: "GIMNASIA ESPORTS" },
      { id: 4, name: "HYT ESPORTS" },
    ]

    let listaRandom = [];

    //ORDENA LOS EQUIPOS EN NUEVO ARRAY DE FORMA RANDOM
    while(listaEquipos.length > 0){
      const random = Math.floor(Math.random() * listaEquipos.length);
      const equipo = listaEquipos[random];

      listaRandom.push(equipo);
      listaEquipos.splice(random, 1)
    }
    
    //EL EQUIPO AL AZAR SELECCIONADO, ENFRENTARLO CON LOS EQUIPOS RESTANTES
    for (let index = 0; index < listaRandom.length; index++) {
      const element = listaRandom[index];

      
    }

    console.log(this.listaMatch)
  }

}
