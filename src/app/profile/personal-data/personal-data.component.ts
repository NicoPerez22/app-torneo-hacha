import { Component, inject, OnInit, Input } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/service/user.service';

@Component({
  standalone: false,
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit {
  @Input() myUser;
  private readonly modalData = inject<{ myUser?: any }>(NZ_MODAL_DATA, {
    optional: true,
  });

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.myUser = this.myUser ?? this.modalData?.myUser;
    this._initForm();

    this.form.patchValue({ ...this.myUser })
  }

  onSubmit(){
    const user = {
      name: this.form.get('name').value,
      lastName: this.form.get('lastName').value,
      email: this.form.get('email').value,
      userName: this.form.get('userName').value,
    }

    this.userService.update(this.myUser.id, user).subscribe({
      next: (resp) => {

      }
    })
  }

  private _initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['']
    });
  }

}
