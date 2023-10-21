import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTournammentComponent } from './create-tournamment.component';

describe('CreateTournammentComponent', () => {
  let component: CreateTournammentComponent;
  let fixture: ComponentFixture<CreateTournammentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTournammentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTournammentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
