export interface GenericPagination {
  totalRows: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export interface GenericResponse<T> {
  message: string;
  data: T;
}
