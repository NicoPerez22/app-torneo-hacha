import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formLoginUser: any;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.createformLoginUser();
  }

  onSubmit(){
    const { email, password } = this.formLoginUser.getRawValue();
    this.authService.login(email, password)
    .then((user) => {
      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
        this.router.navigate(['/home'])
      }, 500)
    })
    .catch(error => {
      console.log(error)
    })
    
  }

  createformLoginUser(){
    this.formLoginUser = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  get email(): FormControl {
    return this.formLoginUser.get('email')
  }

  get password(): FormControl {
    return this.formLoginUser.get('password')
  }
}
