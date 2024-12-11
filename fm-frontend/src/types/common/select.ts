// import { IIconBuilder } from 'interfaces/iconBuilder'

export interface IOption<Type> {
  label: string;
  value: Type;
}

export interface IOptionWithIcon<Type> {
  label: string;
  value: Type;
  // icon?: IIconBuilder
  icon?: any;
}

export interface IDropdownItem<Type> {
  title: string;
  value: Type;
}

export interface IDropdown {
  title: string;
  value: string | number;
}
