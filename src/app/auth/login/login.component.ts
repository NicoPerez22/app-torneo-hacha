import { LoginService } from 'src/app/service/login.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this._initForm();
  }

  onLogin() {
    this.authService.login(this.form.getRawValue()).subscribe({
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
  }

  private _initForm() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
}
