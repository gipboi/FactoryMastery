import { useController } from 'react-hook-form'
import { AsyncPaginate } from 'react-select-async-paginate'

export type IDebouncedAsyncMultiSelectProps = any

const DebouncedAsyncSelect = (props: IDebouncedAsyncMultiSelectProps) => {
  const { name, control, defaultValue = '' } = props
  const {
    field: { ref, ...inputProps }
    // fieldState: { invalid, isTouched, isDirty },
    // formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules: { required: true },
    defaultValue
  })
  return <AsyncPaginate debounceTimeout={300} {...props} {...inputProps} inputRef={ref} />
}

export default DebouncedAsyncSelect
