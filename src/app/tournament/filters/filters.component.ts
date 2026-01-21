import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { InputComponent } from './input/input.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.clearComponents();
  }

  onCreateComponent(): void {
    const componentRef = this.container.createComponent(InputComponent);
    componentRef.instance.label = 'Pokemon';
    componentRef.instance.control = 'name';
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
    if (this.container) {
      this.container.clear();
    }
  }
}
