import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzSpinModule,
    NzListModule,
    NzModalModule,
    NzStepsModule
  ],
  exports: [
    CommonModule,
    HeaderComponent,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzSpinModule,
    NzListModule,
    NzModalModule,
    NzStepsModule
  ],
})
export class SharedModule {}
