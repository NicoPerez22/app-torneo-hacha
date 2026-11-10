import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/service/auth.service';

export function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  return control.get('newPassword')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}
@Component({ selector: 'app-password-reset', templateUrl: './password-reset.component.html', styleUrls: ['../login/login.component.css'] })
export class PasswordResetComponent implements OnDestroy {
  readonly form = this.fb.nonNullable.group({
    token: ['', [Validators.required, Validators.pattern(/\S/)]],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  }, { validators: matchingPasswords });
  saving = false;
  success = false;
  error = '';
  private readonly destroyed$ = new Subject<void>();
  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService) {}
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); this.form.reset(); }
  submit(): void {
    if (this.saving || this.success) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { token, newPassword } = this.form.getRawValue();
    this.saving = true; this.error = '';
    this.auth.resetPassword(token.trim(), newPassword).pipe(takeUntil(this.destroyed$), finalize(() => this.saving = false)).subscribe({
      next: () => { this.form.reset(); this.success = true; },
      error: () => this.error = 'No se pudo restablecer la contraseña. El token puede haber vencido, haber sido utilizado o reemplazado. Revisá los datos o pedile uno nuevo al administrador.',
    });
  }
}
