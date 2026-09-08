import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSize,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';

export type TableCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type TableRow = Record<string, TableCellValue>;
export type ColumnStyle = Record<
  string,
  string | number | null | undefined
>;

export interface ColumnAction {
  label: string;
  icon: string | null;
  action: (row: TableRow) => void;
}

export interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<TableRow> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<TableRow> | null;
  filterMultiple: boolean | null;
  sortDirections: NzTableSortOrder[] | null;
  columnWidth: string | null;
  icon: string | null;
  key: string | null;
  style: ColumnStyle | null;
  dropdownActions: ColumnAction[] | null;
  rowAction: ((row: TableRow) => void) | null;
  action: ((row: TableRow) => void) | null;
  isDate: boolean;
  className: ((row: TableRow) => string) | null;
  buttonText: string | null;
}
