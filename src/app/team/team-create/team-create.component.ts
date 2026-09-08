import { ToastrService } from 'ngx-toastr';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { TeamService } from 'src/app/service/team.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UploadService } from 'src/app/service/upload.service';
import { Team, TeamView } from '../models/team';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-team-create',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
})
export class TeamCreateComponent implements OnInit {
  readonly teamData = input<TeamView>();
  private readonly modalData = inject<{ teamData?: TeamView }>(NZ_MODAL_DATA, {
    optional: true,
  });
  private readonly data = computed(
    () => this.teamData() ?? this.modalData?.teamData,
  );

  protected readonly form: FormGroup<{
    name: FormControl<string>;
    abreviatura: FormControl<string>;
  }>;
  protected images: Array<{ id?: number; url?: string }> = [];
  protected readonly showSpinner = signal(false);
  protected readonly isEdit = signal(false);

  private readonly team = new Team();
  private readonly teamService = inject(TeamService);
  private readonly uploadService = inject(UploadService);
  private readonly toastr = inject(ToastrService);
  private readonly modalService = inject(NzModalService);
  private readonly fb = inject(NonNullableFormBuilder);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      abreviatura: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data()) {
      this.form.patchValue({ ...this.data() });
      this.isEdit.set(true);
    }
  }

  protected onSubmit(): void {
    const form = this.form.getRawValue();

    this.team.name = form.name;
    this.team.idLogo = this.images[0]?.id || null;
    this.team.id = this.data()?.id || null;

    if (this.isEdit()) {
      this.teamService.updateTeam(this.team).subscribe({
        next: (resp) => {
          if (resp.data) {
            this._onClean();
            this.modalService.closeAll();
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
          this.modalService.closeAll();
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

  protected onLoadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.showSpinner.set(true);
    this.uploadService.setImage(file).subscribe({
      next: (resp) => {
        const uploaded = resp as { id?: number; url?: string };
        this.images.push(uploaded);
        this.showSpinner.set(false);
      },

      error: (err) => {
        console.log(err);
        this.showSpinner.set(false);
      },
    });
  }

  private _onClean(): void {
    this.form.reset();
    this.images = [];
  }

}
