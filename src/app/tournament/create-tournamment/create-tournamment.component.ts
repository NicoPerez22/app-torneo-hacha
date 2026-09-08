import { ToastrService } from 'ngx-toastr';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TournamentService } from '../service/tournament.service';
import { TeamService } from 'src/app/service/team.service';
import { UploadService } from 'src/app/service/upload.service';
import { 
  Format, 
  Team, 
  ImageUrl, 
  CreateTournamentRequest,
  TeamCountOption 
} from '../models/tournament.interface';
import { TOURNAMENT_CONSTANTS, TEAM_COUNT_OPTIONS, CREATE_TOURNAMENT_STEPS } from '../constants/tournament.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-create-tournamment',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './create-tournamment.component.html',
  styleUrls: ['./create-tournamment.component.css'],
})
export class CreateTournammentComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly tournamentService = inject(TournamentService);
  private readonly teamService = inject(TeamService);
  private readonly toastrService = inject(ToastrService);
  private readonly uploadService = inject(UploadService);
  private readonly modalRef = inject(NzModalRef);

  form!: FormGroup;
  formats: Format[] = [];
  availableTeams: Team[] = [];
  readonly teamCountOptions: TeamCountOption[] = TEAM_COUNT_OPTIONS;

  selectedTeams: Team[] = [];
  selectedTeamIds: number[] = [];
  uploadedImages: ImageUrl[] = [];
  isUploadingImage = false;

  currentStep: number = CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA;
  currentStepIndex: number = CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA;

  ngOnInit(): void {
    this.initForm();
    this.loadTeams();
    this.loadFormats();
  }

  onSubmitData(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const formValue = this.form.value;
    const request: CreateTournamentRequest = {
      name: formValue.name,
      teamsIds: this.selectedTeamIds,
      logo: this.uploadedImages[0]?.url || null,
      formatId: formValue.description,
      enableDraft: formValue.draft || false,
    };

    this.tournamentService.createTournament(request).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        if (!response) {
          this.toastrService.error(
            TOURNAMENT_CONSTANTS.TOURNAMENT_CREATE_ERROR,
            TOURNAMENT_CONSTANTS.ERROR_TITLE
          );
          return;
        }

        this.toastrService.success(
          TOURNAMENT_CONSTANTS.TOURNAMENT_CREATED_SUCCESS,
          TOURNAMENT_CONSTANTS.SUCCESS_TITLE
        );
        this.modalRef.close(response);
      },
      error: () => {
        this.toastrService.error(
          TOURNAMENT_CONSTANTS.TOURNAMENT_CREATE_ERROR,
          TOURNAMENT_CONSTANTS.ERROR_TITLE
        );
      },
    });

  }

  onLoadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!this.isValidImageFile(file)) {
      this.toastrService.error('Por favor selecciona un archivo de imagen válido', 'Error');
      return;
    }

    this.isUploadingImage = true;

    this.uploadService.setImage(file).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.uploadedImages = [response as ImageUrl];
        this.isUploadingImage = false;
      },
      error: () => {
        this.toastrService.error('Error al subir la imagen', 'Error');
        this.isUploadingImage = false;
      },
    });

  }

  onSelectTeam(teamId: number): void {
    const maxTeamsControl = this.form.get('countTeams');
    if (!maxTeamsControl || !maxTeamsControl.value) {
      this.toastrService.warning(
        'Primero selecciona la cantidad máxima de equipos',
        TOURNAMENT_CONSTANTS.ATTENTION_TITLE
      );
      return;
    }

    const maxTeams = maxTeamsControl.value.value;

    if (this.selectedTeamIds.length >= maxTeams) {
      this.toastrService.warning(
        TOURNAMENT_CONSTANTS.MAX_TEAMS_REACHED_MESSAGE,
        TOURNAMENT_CONSTANTS.ATTENTION_TITLE
      );
      return;
    }

    const teamIndex = this.availableTeams.findIndex((team) => team.id === teamId);
    if (teamIndex === -1) {
      return;
    }

    const [selectedTeam] = this.availableTeams.splice(teamIndex, 1);
    this.selectedTeams.push(selectedTeam);
    this.selectedTeamIds.push(teamId);

    this.form.get('teams')?.setValue(null);
  }

  onPreviousStep(): void {
    if (this.currentStep > CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA) {
      this.currentStep -= 1;
      this.updateStepIndex();
    }
  }

  onNextStep(): void {
    if (this.currentStep < CREATE_TOURNAMENT_STEPS.TEAMS) {
      const stepValid = this.validateCurrentStep();
      if (stepValid) {
        this.currentStep += 1;
        this.updateStepIndex();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(3)]],
      description: [null, Validators.required],
      countTeams: [null, Validators.required],
      teams: [null],
      draft: [false],
    });
  }

  private loadTeams(): void {
    this.teamService.getTeams().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.availableTeams = (response.data || []) as Team[];
      },
      error: () => {
        this.toastrService.error('Error al cargar los equipos', TOURNAMENT_CONSTANTS.ERROR_TITLE);
      },
    });

  }

  private loadFormats(): void {
    this.tournamentService.getFormats().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.formats = response.data || [];
      },
      error: () => {
        this.toastrService.error('Error al cargar los formatos', TOURNAMENT_CONSTANTS.ERROR_TITLE);
      },
    });

  }

  private validateCurrentStep(): boolean {
    if (this.currentStep === CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA) {
      const nameControl = this.form.get('name');
      const descriptionControl = this.form.get('description');
      const countTeamsControl = this.form.get('countTeams');

      if (!nameControl?.valid) {
        nameControl?.markAsTouched();
      }
      if (!descriptionControl?.valid) {
        descriptionControl?.markAsTouched();
      }
      if (!countTeamsControl?.valid) {
        countTeamsControl?.markAsTouched();
      }

      return nameControl?.valid && descriptionControl?.valid && countTeamsControl?.valid || false;
    }

    return true;
  }

  private updateStepIndex(): void {
    this.currentStepIndex = this.currentStep;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }
}
