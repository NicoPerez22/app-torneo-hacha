import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  formRegisterUser!: FormGroup;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.formRegisterUser.invalid) {
      this.formRegisterUser.markAllAsTouched();
      this.toastrService.warning('Por favor, completa todos los campos');
      return;
    }

    const { email, userName, password } = this.formRegisterUser.getRawValue();
    const payload: RegisterPayload = {
      email,
      username: userName,
      password,
    };

    const registerSub = this.authService.register(payload).subscribe({
      next: () => {
        this.toastrService.success('Cuenta creada exitosamente');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.toastrService.error('No se pudo crear la cuenta, intenta nuevamente');
      },
    });

    this.subscription.add(registerSub);
  }

  private initForm(): void {
    this.formRegisterUser = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Getters for form controls
  get email(): FormControl {
    return this.formRegisterUser.get('email') as FormControl;
  }

  get userName(): FormControl {
    return this.formRegisterUser.get('userName') as FormControl;
  }

  get password(): FormControl {
    return this.formRegisterUser.get('password') as FormControl;
  }
}
