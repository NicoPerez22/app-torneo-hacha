import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastrService.warning('Por favor, completa todos los campos');
      return;
    }

    const loginSub = this.authService.login(this.form.getRawValue()).subscribe({
      next: (resp) => {
        if (resp.code == -1) {
          this.toastrService.error(resp.message,'Error');
          return;
        }

        this.toastrService.success('Inicio de sesión correctamente','Exito');
        this.loginService.login(resp.data, resp.data.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toastrService.error('No se pudo ingresar, la conexión falló');
      },
    });

    this.subscription.add(loginSub);
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // Getters for form controls
  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }
}
