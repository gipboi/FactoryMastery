import { Button, ButtonProps } from '@chakra-ui/react'
import cx from 'classnames'
import useBreakPoint from 'hooks/useBreakPoint'
import { EBreakPoint } from 'constants/theme'
import styles from './actionButton.module.scss'

interface IActionButtonProps extends ButtonProps {
  label: string
}

const ActionButton = (props: IActionButtonProps) => {
  const { label, ...rest } = props
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD)

  return (
    <Button
      {...rest}
      variant="outline"
      background="transparent"
      border="none"
      borderRadius="8px"
      color="gray.700"
      fontWeight={500}
      className={cx(styles.actionHeader, { [styles.actionHeaderBtn]: isMobile })}
      fontSize="16px"
      lineHeight="24px"
    >
      {isMobile ? '' : label}
    </Button>
  )
}
export default ActionButton
