import { Component, computed, inject, input, OnInit } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

interface EditableUser {
  id?: number;
  name?: string;
  lastName?: string;
  email?: string;
  userName?: string;
}

@Component({
  selector: 'app-personal-data',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly modalData = inject<{ myUser?: EditableUser }>(NZ_MODAL_DATA, {
    optional: true,
  });
  readonly myUser = input<EditableUser>();
  private readonly user = computed(() => this.myUser() ?? this.modalData?.myUser);

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    userName: [''],
  });

  ngOnInit(): void {
    this.form.patchValue({ ...this.user() });
  }

  onSubmit(): void {
    this.userService
      .update(this.user()?.id, this.form.getRawValue())
      .subscribe();
  }
}
