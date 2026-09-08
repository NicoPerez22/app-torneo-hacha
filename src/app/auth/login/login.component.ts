import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-login',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly toastrService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastrService.warning('Por favor, completa todos los campos');
      return;
    }

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (resp) => {
        if (resp.code === -1) {
          this.toastrService.error(resp.message, 'Error');
          return;
        }

        const user = resp.data;
        if (!user?.token) {
          this.toastrService.error('No se pudo iniciar sesión', 'Error');
          return;
        }

        this.toastrService.success('Inicio de sesión correctamente', 'Exito');
        this.loginService.login(user, user.token);
        void this.router.navigate(['/home']);
      },
      error: () => {
        this.toastrService.error('No se pudo ingresar, la conexión falló');
      },
    });
  }

  protected get email() {
    return this.form.controls.email;
  }

  protected get password() {
    return this.form.controls.password;
  }
}
