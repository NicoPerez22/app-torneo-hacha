import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { InputComponent } from './input/input.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  form: FormGroup

  constructor(
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    
  }

  createComponent(){    
    // Crear el componente directamente con createComponent
    const componenteRef = this.container.createComponent(InputComponent);
    
    this._initForm();
    // Pasar el valor a la propiedad @Input() del componente hijo
    componenteRef.instance.label = 'Pokemon';
    componenteRef.instance.control = 'name';
  }

  deleteComponent(){
    this.container.clear();
  }

  private _initForm(){
    this.form = this.fb.group({
      name: [null]
    })
  }

}
