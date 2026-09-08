import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  ColumnItem,
  TableCellValue,
  TableRow,
} from './interface/columnItem.interface';

@Component({
  selector: 'app-table',
  imports: [
    DatePipe,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
    NzTableModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  readonly listOfColumns = input<ColumnItem[]>([]);
  readonly listOfData = input<TableRow[]>([]);
  readonly customButton = input(false);
  readonly dropDown = input(false);
  readonly isCustomButton = input(false);
  readonly labelCustomButton = input('');

  protected readonly displayData = computed<TableRow[]>(() =>
    this.listOfData(),
  );

  protected _getDateValue(
    value: TableCellValue,
  ): string | number | Date | null {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return value;
    }

    return null;
  }
}
