import { forwardRef, Tooltip } from '@chakra-ui/react'
import cx from 'classnames'
import SvgIcon from 'components/SvgIcon'
import { IIconBuilder } from 'interfaces/iconBuilder'
import styles from './iconBuilder.module.scss'
import { defaultIconIds, defaultsColor } from './constants'

interface IIConBuilderProps {
  icon?: IIconBuilder
  isActive?: boolean
  onClick?: () => void
  size?: 16 | 24 | 32 | 40 | 64
}

const IconBuilder = (props: IIConBuilderProps) => {
  const { icon, isActive, onClick, size = 64 } = props

  const mainIconComponent = icon?.iconName ? (
    <SvgIcon
      iconName={icon?.iconName ?? ''}
      color={!icon?.isDark ? 'white' : 'black'}
      size={32}
      opacity={!icon?.isDark ? 1 : 0.8}
    />
  ) : null

  if (!icon) {
    return null
  }

  const IconPreview = forwardRef(({ ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={cx(styles.shape, styles[`icon-${icon?.shape}`], styles[`size-${size}`], {
        [styles.active]: isActive,
        [styles.isDefaultIcon]: defaultIconIds.includes(Number(icon?.id ?? icon?._id) ?? 0),
        [styles[`defaultColor-${defaultsColor.findIndex(color => color === icon?.color)}`]]: defaultIconIds.includes(
          Number(icon?.id ?? icon?._id ?? 0)
        )
      })}
      //*INFO: set icon color to override default background color
      // @ts-ignore
      style={{ backgroundColor: icon?.color, '--icon-color': icon?.color }}
      onClick={onClick}
    >
      {mainIconComponent}
    </div>
  ))

  return (
    <>
      {icon?.description ? (
        <Tooltip
          label={icon.description}
          height="36px"
          fontSize="14px"
          lineHeight="20px"
          fontWeight="400"
          padding={2}
          placement="top-start"
          background="#5C5C5C"
          color="white"
          hasArrow
          borderRadius="4px"
          shouldWrapChildren={!!onClick}
        >
          <IconPreview />
        </Tooltip>
      ) : (
        <IconPreview />
      )}
    </>
  )
}

export default IconBuilder
