import { ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from 'src/app/service/team.service';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UploadService } from 'src/app/service/upload.service';
import { Team } from '../models/team';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
})
export class TeamCreateComponent implements OnInit {
  @Input() teamData: any

  form: FormGroup;
  images: Array<any> = [];
  team: Team = new Team();
  showSpinner: boolean = false;

  isEdit: boolean = false;

  constructor(
    private teamService: TeamService,
    private uploadService: UploadService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private NzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    this._initForm();

    if(this.teamData){
      console.log(this.teamData)  
      this.form.patchValue({ ...this.teamData })
      this.isEdit = true;
    }
  }

  onSubmit() {
    const form = this.form.getRawValue();

    this.team.name = form.name; 
    this.team.idLogo = this.images[0]?.id || null;
    this.team.id = this.teamData.id || null;


    if(this.isEdit){
      this.teamService.updateTeam(this.team).subscribe({
        next: (resp) => {
          if (resp.data) {
            this._onClean();
            this.NzModalService.closeAll();
            this.toastr.success(resp?.message);
          } else {
            this.toastr.error(resp?.message);
          }
        },
  
        error: (err) => {
          this.toastr.error(err);
        },
      })

      return;
    }

    this.teamService.createTeam(this.team).subscribe({
      next: (resp) => {
        if (resp.data) {
          this._onClean();
          this.NzModalService.closeAll();
          this.toastr.success(resp?.message);
        } else {
          this.toastr.error(resp?.message);
        }
      },

      error: (err) => {
        this.toastr.error(err);
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

  private _onClean() {
    this.form.reset();
    this.images = [];
  }

  private _initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      abreviatura: ['', Validators.required],
    });
  }
}
