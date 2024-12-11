import { IIconBuilder } from "interfaces/iconBuilder";

export interface IAsyncSelectOption<T> {
  label?: string;
  value?: T;
}

export interface AggregationPaginated<Type> {
  paginatedResults: Type[];
  totalResults:
    | number
    | {
        count: number;
      }[];
  timeTracking?: number;
}

export interface IAsyncSelectOptionWithIcon<T> {
  label?: string;
  value?: T;
  icon?: IIconBuilder;
  image?: string;
}

export type IResponse<T = string> = {
  label?: string;
  options: IAsyncSelectOption<T>[] | IAsyncSelectOptionWithIcon<T>[];
  hasMore?: boolean;
};
