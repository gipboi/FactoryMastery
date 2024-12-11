import { Button, ButtonProps } from '@chakra-ui/react'
import cx from 'classnames'
import styles from './customButton.module.scss'

interface ICustomButtonProps extends ButtonProps {
  onClick?: () => void
  content?: string
  className?: string
}

const CustomButton = (props: ICustomButtonProps) => {
  const { onClick, content, className, ...rest } = props

  return (
    <Button
      {...rest}
      className={cx(styles[className ?? ''])}
      variant="outline"
      borderRadius="6px"
      fontWeight={500}
      margin={2}
      marginRight={0}
      fontSize="md"
      lineHeight={6}
      onClick={onClick}
    >
      {content}
    </Button>
  )
}

export default CustomButton
