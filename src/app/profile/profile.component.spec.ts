import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ProfileComponent } from './profile.component';
import { LoginService } from '../service/login.service';
import { UserService } from '../service/user.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserByID: () => of({ data: { user: {}, id: null } }),
          },
        },
        { provide: LoginService, useValue: { user: { id: 1 } } },
        { provide: NzModalService, useValue: { create: () => undefined } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
