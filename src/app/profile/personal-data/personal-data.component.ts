import { Component, computed, inject, input, OnInit } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-personal-data',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit {
  readonly myUser = input<any>();
  private readonly modalData = inject<{ myUser?: any }>(NZ_MODAL_DATA, {
    optional: true,
  });
  private readonly user = computed(() => this.myUser() ?? this.modalData?.myUser);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this._initForm();

    this.form.patchValue({ ...this.user() })
  }

  onSubmit(){
    const user = {
      name: this.form.get('name').value,
      lastName: this.form.get('lastName').value,
      email: this.form.get('email').value,
      userName: this.form.get('userName').value,
    }

    this.userService.update(this.user()?.id, user).subscribe({
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
