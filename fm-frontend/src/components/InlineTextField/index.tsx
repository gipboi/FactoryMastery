import { useState, useRef, useEffect, forwardRef } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import cx from 'classnames'
import { Input, InputProps } from 'reactstrap'
import Icon from 'components/Icon'
import styles from './inlineTextField.module.scss'

interface InlineTextFieldProps extends Omit<InputProps, 'onChange'> {
  type?: 'text' | 'email' | 'password' | 'textarea'
  error?: boolean
  onStartEdit?: Function // trigger when editor mode is on
  onApplyChange?: Function // trigger only when apply new change
  onStopEdit?: Function // trigger when either apply new change or cancel edit
  autofit?: boolean
  noedit?: boolean
  editFirst?: boolean
}

const InlineTextField = forwardRef<any, InlineTextFieldProps>((props: InlineTextFieldProps, ref) => {
  const {
    className,
    error = false,
    type = 'text',
    onStartEdit = () => {},
    onApplyChange = () => {},
    onStopEdit = () => {},
    value,
    autofit = false,
    disabled = false,
    noedit = false,
    editFirst = false,
    style,
    ...rest
  } = props
  const [enableEdit, setEnableEdit] = useState<boolean>(editFirst)
  const [inputWidth, setInputWidth] = useState<string>('100%')
  const [inputVal, setInputVal] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const labelRef = useRef<HTMLDivElement>(null)
  const classes: (string | never)[] = []

  async function handleChange(event: React.MouseEvent<HTMLSpanElement, MouseEvent>): Promise<void> {
    event.stopPropagation()
    if (!disabled) {
      setIsLoading(true)
      await onApplyChange(inputVal)
      setIsLoading(false)
      onStopEdit()
    }
  }

  useEffect(() => {
    setInputVal(`${value || ''}`)
  }, [value])

  useEffect(() => {
    if (autofit && labelRef) {
      setInputWidth(`${labelRef.current?.clientWidth}px`)
    } else {
      setInputWidth('100%')
    }
    setEnableEdit(editFirst)
  }, [editFirst])

  useEffect(() => {
    if (enableEdit) {
      onStartEdit()
    }
  }, [enableEdit])

  if (!enableEdit) {
    classes.push(styles.hfInlineTextFieldView)
    return (
      <div ref={labelRef} className={cx(...classes, className)}>
        <span>{value}</span>
        {noedit ? null : (
          <Icon
            icon="pen"
            group="unicon"
            id={styles.editBtn}
            onClick={e => {
              e.stopPropagation()
              if (disabled) return
              if (autofit && labelRef) {
                setInputWidth(`${labelRef.current?.clientWidth}px`)
              } else {
                setInputWidth('100%')
              }
              setEnableEdit(true)
            }}
          />
        )}
      </div>
    )
  }

  classes.push(styles.hfInlineTextFieldEdit)
  if (error) classes.push(styles.errorWrapper)

  return (
    <div className={cx(...classes, className)} style={{ width: inputWidth, ...style }}>
      {isLoading ? (
        <Box className={styles.spinner}>
          <Spinner size="sm" />
        </Box>
      ) : (
        <>
          <Icon
            icon="check"
            group="unicon"
            style={{ color: disabled ? 'grey' : 'green', right: 20 }}
            className={styles.interactIcon}
            onClick={handleChange}
          />
          <Icon
            icon="times"
            group="unicon"
            style={{ color: disabled ? 'grey' : 'red', right: 0 }}
            className={styles.interactIcon}
            onClick={e => {
              e.stopPropagation()
              if (!disabled) {
                setEnableEdit(false)
                setInputVal(`${value || ''}`)
                onStopEdit()
              }
            }}
          />
        </>
      )}

      <Input
        type={type}
        value={inputVal}
        onChange={event => setInputVal(event.target.value)}
        onClick={event => event.stopPropagation()}
        onKeyDown={event => {
          event.stopPropagation()
          if (!disabled && event.key === 'Enter') {
            setEnableEdit(false)
            onApplyChange(inputVal)
            onStopEdit()
          }
        }}
        disabled={disabled}
        {...rest}
        innerRef={ref}
      />
    </div>
  )
})

export default InlineTextField
