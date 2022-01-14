export interface Pagination {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}
export interface TableRequestProp {
  pagination: Pagination;
}
