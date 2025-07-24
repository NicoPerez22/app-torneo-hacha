import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSize,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';

export interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<any> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<any> | null;
  filterMultiple: boolean | null;
  sortDirections: NzTableSortOrder[] | null;
  columnWidth: string | null;
  icon: string | null;
  key: string | null;
  style: any | null;
  dropdownActions: any;
  rowAction;
  action;
  isDate;
  className;
  buttonText;
}
