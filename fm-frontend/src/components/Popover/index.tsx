import cx from 'classnames'
import { UncontrolledPopover, PopoverHeader, PopoverBody, UncontrolledPopoverProps } from 'reactstrap'
import styles from './styles.module.scss'

interface PopoverProps {
  title?: string
  body?: any
  // legacy: allow popover to dismiss when click outside
  // hover: toggle popover on hovering the target
  // <undefined>: toggle popover by click on target
  trigger?: 'legacy' | 'hover'
}

const Popover = ({ className, title = '', body = '', ...props }: UncontrolledPopoverProps & PopoverProps) => {
  return (
    <UncontrolledPopover className={cx(styles.hfPopover, className)} {...props}>
      <PopoverHeader>{title}</PopoverHeader>
      <PopoverBody>{body}</PopoverBody>
    </UncontrolledPopover>
  )
}

export default Popover
