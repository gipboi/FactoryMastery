export interface IChakraInputDropdownProps {
  name: string
  label: string
  optionsData: IOption[]
  placeholder?: string
  selectedData?: IOption[]
  chooseOptionsHandler: (value: string) => void
  disabled?: boolean
}

export interface IOption {
  label: string
  value: string
  checked?: boolean
}
