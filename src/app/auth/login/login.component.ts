import { CookieService } from 'ngx-cookie-service';
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
    private router: Router,
    private cookieService: CookieService
  ){}

  ngOnInit(): void {
    this.createformLoginUser();
  }

  onSubmit(){
    const userLogin = this.formLoginUser.value;

    this.authService.login(userLogin)
    .subscribe((res) => {
      if(res.status == 200){
        window.sessionStorage.setItem('token', res.token)
        this.authService.saveUser(res.user);
        this.authService.setUserObservable = res.user;
        this.router.navigate(['/home'])
      }
    })
  }

  createformLoginUser(){
    this.formLoginUser = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  get username(): FormControl {
    return this.formLoginUser.get('username')
  }

  get password(): FormControl {
    return this.formLoginUser.get('password')
  }
}
