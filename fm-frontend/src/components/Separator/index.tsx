import cx from 'classnames'
import styles from './styles.module.scss'

interface SeparatorProps {
  text?: string
}

const Separator = ({ className, text = '', ...props }: React.HTMLProps<HTMLDivElement> & SeparatorProps) => {
  return (
    <div className={cx(styles.hfSeparator, className)} {...props}>
      {text}
    </div>
  )
}

export default Separator
