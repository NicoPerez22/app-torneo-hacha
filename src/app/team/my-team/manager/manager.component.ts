import { UserService } from './../../../service/user.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css'],
})
export class ManagerComponent implements OnInit {
  form: FormGroup;
  teams: Array<any> = [];
  users: Array<any> = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly teamService: TeamService,
    private readonly userService: UserService,
    private readonly toasteService: ToastrService,
    private readonly modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._getTeams();
    this._getUsers();
  }

  onSubmit() {
    const id = this.form.get('manager').value;
    const idTeam = this.form.get('teamDestination').value;

    this.teamService.transferManager(idTeam, id).subscribe({
      next: (resp) => {
        this.toasteService.success(resp.msg);
        this.modalRef.close(true);
      },

      error: () => {},
    });
  }

  private _initForm() {
    this.form = this.fb.group({
      manager: [null, Validators.required],
      teamDestination: [null, Validators.required],
    });
  }

  private _getTeams() {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp.data;
      },
    });
  }

  private _getUsers() {
    this.userService.getUsers().subscribe({
      next: (resp) => {
        this.users = resp.data;
      },

      error: () => {},
    });
  }
}
