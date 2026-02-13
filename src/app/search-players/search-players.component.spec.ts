import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SearchPlayersComponent } from './search-players.component';
import { TeamService } from '../service/team.service';
import { UserService } from '../service/user.service';
import { LoginService } from '../service/login.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('SearchPlayersComponent', () => {
  let component: SearchPlayersComponent;
  let fixture: ComponentFixture<SearchPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchPlayersComponent],
      providers: [
        {
          provide: TeamService,
          useValue: {
            getPlayers: () => of({ data: [] }),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserByID: () => of({ data: { user: { teams: [{ id: 1 }] } } }),
          },
        },
        {
          provide: LoginService,
          useValue: {
            user: { id: 1 },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => undefined,
          },
        },
        {
          provide: NzModalService,
          useValue: {
            create: () => undefined,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
