import { Component, inject, OnDestroy, OnInit, viewChild, ViewContainerRef } from '@angular/core';
import { InputComponent } from './input/input.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-filters',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.clearComponents();
  }

  onCreateComponent(): void {
    const componentRef = this.container().createComponent(InputComponent);
    componentRef.setInput('label', 'Pokemon');
    componentRef.setInput('control', 'name');
  }

  onDeleteComponent(): void {
    this.clearComponents();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: [null],
    });
  }

  private clearComponents(): void {
    this.container().clear();
  }
}
