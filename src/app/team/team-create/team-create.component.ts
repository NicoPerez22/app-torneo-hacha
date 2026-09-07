import { ToastrService } from 'ngx-toastr';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { TeamService } from 'src/app/service/team.service';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UploadService } from 'src/app/service/upload.service';
import { Team } from '../models/team';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-team-create',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
})
export class TeamCreateComponent implements OnInit {
  readonly teamData = input<any>();
  private readonly modalData = inject<{ teamData?: any }>(NZ_MODAL_DATA, {
    optional: true,
  });
  private readonly data = computed(
    () => this.teamData() ?? this.modalData?.teamData,
  );

  form: FormGroup;
  images: Array<any> = [];
  storedImages: Array<any> = [];
  team: Team = new Team();
  readonly showSpinner = signal(false);
  readonly isEdit = signal(false);

  constructor(
    private teamService: TeamService,
    private uploadService: UploadService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private NzModalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this._initForm();

    if (this.data()) {
      this.form.patchValue({ ...this.data() });
      this.isEdit.set(true);
    }
  }

  onSubmit() {
    const form = this.form.getRawValue();

    this.team.name = form.name;
    this.team.idLogo = this.images[0]?.id || null;
    this.team.id = this.data()?.id || null;

    if (this.isEdit()) {
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
      });

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

    this.showSpinner.set(true);
    this.uploadService.setImage(file).subscribe({
      next: (resp) => {
        this.images.push(resp);
        this.showSpinner.set(false);
      },

      error: (err) => {
        console.log(err);
        this.showSpinner.set(false);
      },
    });
  }

  // onGetStoredImages() {
  //   this._getStoredImages();

  //   const modal = this.modalService.create({
  //     nzContent: ResultsComponent,
  //     nzComponentParams: {
  //       match: value
  //     },
  //     nzFooter: null,
  //     nzWidth: '95vw',
  //     nzStyle: { maxWidth: '1100px' },
  //     nzBodyStyle: { padding: '16px' },
  //     nzCentered: true,
  //     nzWrapClassName: 'match-report-modal-wrap',
  //     nzClassName: 'match-report-modal',
  //   });
  // }

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

  private _getStoredImages() {
    this.uploadService.getImages().subscribe({
      next: (resp) => {
        this.storedImages = resp;
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
}
