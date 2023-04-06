import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  formRegisterUser: any;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.createformLoginUser();
  }

  createformLoginUser(){
    this.formRegisterUser = this.fb.group({
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  onSubmit(){
    // if(this.formRegisterUser.valid){
    //   const { email, userName, password } = this.formRegisterUser.getRawValue();
      
    //   this.authService.register(email, password, userName)
    //   .then((user) => {
    //     this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //       return false;
    //     };
    //     this.router.navigate(['/home'])
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })
    // } else {
    //   this.formRegisterUser.markAllAsTouched();
    // }
    
  }

  get email(): FormControl {
    return this.formRegisterUser.get('email')
  }

  get userName(): FormControl {
    return this.formRegisterUser.get('userName')
  }

  get password(): FormControl {
    return this.formRegisterUser.get('password')
  }

}
