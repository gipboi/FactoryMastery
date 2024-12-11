import classNames from 'classnames'
import styles from './styles.module.scss'

interface IDividerProps extends React.HTMLProps<HTMLDivElement> {}

const Divider = ({ className, ...props }: IDividerProps) => {
  return <div className={classNames([styles.divider, className])} {...props} />
}

export default Divider
