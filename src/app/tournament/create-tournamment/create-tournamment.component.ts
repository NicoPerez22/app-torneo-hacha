import { ToastrService } from 'ngx-toastr';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TournamentService } from '../service/tournament.service';
import { Router } from '@angular/router';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-tournamment',
  templateUrl: './create-tournamment.component.html',
  styleUrls: ['./create-tournamment.component.css'],
})
export class CreateTournammentComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  formats: Format[] = [];
  availableTeams: Team[] = [];
  teamCountOptions: TeamCountOption[] = TEAM_COUNT_OPTIONS;

  selectedTeams: Team[] = [];
  selectedTeamIds: number[] = [];
  uploadedImages: ImageUrl[] = [];
  isUploadingImage = false;

  currentStep: number = CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA;
  currentStepIndex: number = CREATE_TOURNAMENT_STEPS.TOURNAMENT_DATA;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private teamService: TeamService,
    private toastrService: ToastrService,
    private router: Router,
    private uploadService: UploadService,
    private modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTeams();
    this.loadFormats();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

    const createSub = this.tournamentService.createTournament(request).subscribe({
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

    this.subscriptions.add(createSub);
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

    const uploadSub = this.uploadService.setImage(file).subscribe({
      next: (response: ImageUrl) => {
        this.uploadedImages = [response];
        this.isUploadingImage = false;
      },
      error: () => {
        this.toastrService.error('Error al subir la imagen', 'Error');
        this.isUploadingImage = false;
      },
    });

    this.subscriptions.add(uploadSub);
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
    const teamsSub = this.teamService.getTeams().subscribe({
      next: (response) => {
        this.availableTeams = response.data || [];
      },
      error: () => {
        this.toastrService.error('Error al cargar los equipos', TOURNAMENT_CONSTANTS.ERROR_TITLE);
      },
    });

    this.subscriptions.add(teamsSub);
  }

  private loadFormats(): void {
    const formatsSub = this.tournamentService.getFormats().subscribe({
      next: (response) => {
        this.formats = response.data || [];
      },
      error: () => {
        this.toastrService.error('Error al cargar los formatos', TOURNAMENT_CONSTANTS.ERROR_TITLE);
      },
    });

    this.subscriptions.add(formatsSub);
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
