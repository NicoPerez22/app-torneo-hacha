import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent {
  @Input() label?: string;
  @Input() value?: string | number;
  @Input() control?: string;
}
