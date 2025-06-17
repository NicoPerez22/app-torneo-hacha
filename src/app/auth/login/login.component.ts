import { LoginService } from 'src/app/service/login.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  formLoginUser: any;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.createformLoginUser();
  }

  onLogin() {
    if (this.formLoginUser.valid) {
      const loginForm: any = {
        email: this.formLoginUser.value.email,
        password: this.formLoginUser.value.password,
      };

      this.authService.login(loginForm).subscribe({
        next: (resp) => {
          if (resp.httpCode == 200) {
            this.toastrService.success('Bienvenido');
            this.loginService.login(resp.data);

            this.router.navigate(['/home']);
          } else {
            this.toastrService.error('Usuario o contraseña incorrectos');
          }
        },
        error: () => {
          this.toastrService.error('No se pudo ingresar, la conexión falló');
        },
      });
    } else {
      this.toastrService.error('El formulario es inválido');
    }
  }

  createformLoginUser() {
    this.formLoginUser = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get username(): FormControl {
    return this.formLoginUser.get('username');
  }

  get password(): FormControl {
    return this.formLoginUser.get('password');
  }
}
