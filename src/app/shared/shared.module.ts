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
import { NzTableModule } from 'ng-zorro-antd/table';
import { TableComponent } from './components/table/table.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TradeComponent } from './components/trade/trade.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatchComponent } from '../team/my-team/match/match.component';

@NgModule({
  declarations: [HeaderComponent, TableComponent, TradeComponent, MatchComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzSpinModule,
    NzListModule,
    NzModalModule,
    NzStepsModule,
    NzTableModule,
    NzDropDownModule,
    NgxPaginationModule,
    NzTabsModule,
  ],
  exports: [
    CommonModule,
    HeaderComponent,
    TableComponent,
    MatchComponent,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzSpinModule,
    NzListModule,
    NzModalModule,
    NzStepsModule,
    NzTableModule,
    NzDropDownModule,
    NgxPaginationModule,
    NzTabsModule,
    NzModalModule
  ],
})
export class SharedModule {}
