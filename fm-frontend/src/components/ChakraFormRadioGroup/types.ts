import { IAsyncSelectOption } from "interfaces"

export interface IChakraFormRadioGroupProps {
  name: string
  label: string
  optionsData: IAsyncSelectOption<string | number>[]
  defaultValue?: IAsyncSelectOption<string | number>
  reverseRow?: boolean
}
