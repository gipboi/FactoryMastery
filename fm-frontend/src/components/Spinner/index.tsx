import cx from 'classnames'

interface SpinnerProps {
  className?: string
  inline?: boolean
  size?: 'lg' | 'md' | 'sm'
  type?: 'bordered' | 'grow'
  color?: string
}

const Spinner = ({
  inline = false,
  type = 'bordered',
  color = 'primary',
  ...props
}: React.HTMLProps<HTMLDivElement> & React.HTMLProps<HTMLSpanElement> & SpinnerProps) => {
  const WrappingTag = inline ? 'span' : 'div'

  return (
    <WrappingTag
      role="status"
      className={cx(
        { 'spinner-border': type === 'bordered', 'spinner-grow': type === 'grow' },
        [`text-${color}`],
        { [`avatar-${props.size}`]: props.size },
        props.className
      )}
    />
  )
}

export default Spinner
