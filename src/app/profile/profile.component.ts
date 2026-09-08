import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../service/user.service';
import { LoginService } from '../service/login.service';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

interface ProfileUser {
  id?: number;
  name?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  logo?: { secureUrl?: string };
}

interface ProfileTeam {
  id?: number | null;
  name?: string;
  logo?: { secureUrl?: string };
}

@Component({
  selector: 'app-profile',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly loginService = inject(LoginService);
  private readonly modalService = inject(NzModalService);

  protected user?: ProfileUser;
  protected team?: ProfileTeam;

  ngOnInit(): void {
    this.getProfile(this.loginService.user?.id);
  }

  protected onEdit(): void {
    const modal = this.modalService.create({
      nzTitle: 'Editar perfil',
      nzContent: PersonalDataComponent,
      nzWidth: '800px',
      nzData: {
        myUser: this.user,
      },
      nzOnOk: () =>
        modal.getContentComponentRef()?.instance?.onSubmit?.(),
    });

    modal.afterClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getProfile(this.loginService.user?.id));
  }

  private getProfile(id: number | undefined): void {
    if (!id) {
      return;
    }
    this.userService
      .getUserByID(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (resp) => {
        this.user = resp.data?.user;
        this.team = resp.data as ProfileTeam | undefined;
      },
      });
  }
}
