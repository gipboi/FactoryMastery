export interface IBaseResponse<T> {
  data: T;
  message: string;
}
export interface PaginationList<T> {
  results: T[];
  totalCount: {
    total: number;
  }[];
}

export interface IAsyncSelectOption<T> {
  label?: string;
  value?: T;
}
