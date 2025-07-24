import { Component, Input } from '@angular/core';
import { ColumnItem } from './interface/columnItem.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  @Input() listOfColumns: ColumnItem[] = [];
  @Input() listOfData: any[] = [];
  @Input() customButton: boolean = false;
  @Input() dropDown: boolean = false;

  @Input() isCustomButton: boolean = false;
  @Input() labelCustomButton: string = '';

  ngOnInit(): void {
    this._compareColumnsAndData();
  }

  private _compareColumnsAndData() {
    this.listOfData = this.listOfData.map((data) => {
      const styles: { [key: string]: any } = {};
      const icons: { [key: string]: any } = {};

      this.listOfColumns.forEach((column) => {
        if (column.key || column.icon) {
          styles[column.key] = column.style;
          icons[column.icon] = column.icon;
        }
      });

      return { ...data, styles };
    });
  }
}
