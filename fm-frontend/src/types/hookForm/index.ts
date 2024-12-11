export type FormRegister = (Ref?: any, validateRule?: any) => React.LegacyRef<HTMLInputElement>
export type FallbackFormRegister = (ref?: any) => void | any
export type SetError = (name: any, value: { message: string }) => void
export type ClearErrors = (name: string) => void
export type Reset = (formValue: Record<string, unknown>) => void
export type Event = { target?: HTMLInputElement; currentTarget?: HTMLInputElement }
export type SetValue = (
  name: string,
  value?: any,
  config?:
    | Partial<{
        shouldValidate: boolean
        shouldDirty: boolean
      }>
    | undefined
) => void
