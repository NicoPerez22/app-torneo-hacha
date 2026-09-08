import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  lastName: string;
  name: string;
}

@Component({
  selector: 'app-register',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastrService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly formRegisterUser = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    lastName: ['', Validators.required],
    name: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.formRegisterUser.invalid) {
      this.formRegisterUser.markAllAsTouched();
      this.toastrService.warning('Por favor, completa todos los campos');
      return;
    }

    const { email, userName, password, lastName, name } = this.formRegisterUser.getRawValue();
    const payload: RegisterPayload = {
      email,
      username: userName,
      lastName,
      name,
      password,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.toastrService.success('Cuenta creada exitosamente');
        void this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.toastrService.error('No se pudo crear la cuenta, intenta nuevamente');
      },
    });
  }

  protected get email() {
    return this.formRegisterUser.controls.email;
  }

  protected get userName() {
    return this.formRegisterUser.controls.userName;
  }

  protected get password() {
    return this.formRegisterUser.controls.password;
  }

  protected get lastName() {
    return this.formRegisterUser.controls.lastName;
  }

  protected get name() {
    return this.formRegisterUser.controls.name;
  }
}
