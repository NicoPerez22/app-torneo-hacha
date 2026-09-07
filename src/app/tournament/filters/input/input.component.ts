import { Component, input } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-input',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class InputComponent {
  readonly label = input<string | undefined>();
  readonly value = input<string | number | undefined>();
  readonly control = input<string | undefined>();
}
