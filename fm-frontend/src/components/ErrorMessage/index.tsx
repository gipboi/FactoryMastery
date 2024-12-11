import { Fragment } from 'react'
import cx from 'classnames'
import { CardText } from 'reactstrap'
import styles from './styles.module.scss'

interface IErrorMessageProps {
  error?: string
  smallSpacing?: boolean
}

const ErrorMessage = (props: IErrorMessageProps) => {
  const { error, smallSpacing } = props

  return (
    <Fragment>
      {error && (
        <CardText className={cx(styles.errorText, { [styles.smallSpacingTop]: smallSpacing })}>{error}</CardText>
      )}
    </Fragment>
  )
}

export default ErrorMessage
