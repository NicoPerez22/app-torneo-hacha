import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PersonalDataComponent } from './personal-data.component';
import { UserService } from 'src/app/service/user.service';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDataComponent],
      providers: [
        {
          provide: UserService,
          useValue: { update: () => of({}) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
