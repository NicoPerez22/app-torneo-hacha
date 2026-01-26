import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reports } from '../../models/report';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  form: FormGroup;
  uploadedImages
  isUploadingImage

  playersHome
  
  private readonly fb = inject(FormBuilder)

  ngOnInit(): void {
    this._initForm();
  }

  onSubmit(){
    let report: Reports = new Reports();



  }

  onLoadImage(event){

  }

  private _initForm(){
    this.form = this.fb.group({
      homeGoals: [null, Validators.required],
      awayGoals: [null, Validators.required],
      events: [null]
    })
  }


  // {
  //   "roundId": 798,
  //   "tournamentId": 31,
  //   "homeGoals": 1,
  //   "awayGoals": 4,
  //   "events": [
  //     { "teamId": 12, "playerId": 55, "eventType": "GOAL", "minute": 12 },
  //     { "teamId": 12, "playerId": 55, "eventType": "GOAL", "minute": 44 },
  //     { "teamId": 13, "playerId": 77, "eventType": "YELLOW", "minute": 80 },
  //     { "teamId": 13, "playerId": 78, "eventType": "RED", "minute": 90 },
  //     { "teamId": 13, "playerId": 78, "eventType": "INJURY", "minute": 89, "notes": "Tirón muscular" }
  //   ]
  // }
}
