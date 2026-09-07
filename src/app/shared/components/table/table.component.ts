import { Component, computed, input } from '@angular/core';
import { ColumnItem } from './interface/columnItem.interface';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-table',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  readonly listOfColumns = input<ColumnItem[]>([]);
  readonly listOfData = input<any[]>([]);
  readonly customButton = input(false);
  readonly dropDown = input(false);
  readonly isCustomButton = input(false);
  readonly labelCustomButton = input('');

  readonly displayData = computed(() => {
    const columns = this.listOfColumns();
    return this.listOfData().map((data) => {
      const styles: { [key: string]: any } = {};
      columns.forEach((column) => {
        if (column.key || column.icon) {
          styles[column.key] = column.style;
        }
      });
      return { ...data, styles };
    });
  });
}
