import { TeamService } from './../service/team.service';
import { AuthService } from 'src/app/service/auth.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../service/user.service';
import { LoginService } from '../service/login.service';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any;
  team: any;

  constructor(
    private readonly userService: UserService,
    private readonly loginService: LoginService,
    private readonly modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this._getProfile(this.loginService.user.id);
  }

  onEdit() {
    const modal = this.modalService.create({
      nzTitle: 'Editar perfil',
      nzContent: PersonalDataComponent,
      nzWidth: '800px',
      nzComponentParams: {
        myUser: this.user,
      },
      nzOnOk: () => modal.componentInstance?.onSubmit(),
    });

    modal.afterClose.subscribe((result) => {
      this._getProfile(this.loginService.user.id);
    });
  }

  private _getProfile(id) {
    this.userService.getUserByID(id).subscribe({
      next: (resp) => {
        this.user = resp.data.user;
        this.team = resp.data;
      },
    });
  }
}
