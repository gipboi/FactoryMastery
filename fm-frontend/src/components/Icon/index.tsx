import React from 'react'
import cx from 'classnames'
import { EIconDefaultIconName, EIconShape, EIconType, IIconBuilder } from 'interfaces/iconBuilder'
import { primary500 } from 'themes/globalStyles'

interface IconProps extends React.HTMLProps<HTMLSpanElement> {
  group: 'unicon' | 'dripicon' | 'muiicon' | 'fontawesome' | 'lineawesome'
  icon: string
  className?: string
}

const ICON_GROUP_PREFIX = {
  unicon: 'uil',
  dripicon: 'dripicons',
  muiicon: 'mdi',
  fontawesome: 'fas fa',
  lineawesome: 'las la'
}

export const blockIcon: IIconBuilder = {
  id: "",
  _id: "",
  shape: EIconShape.CIRCLE,
  color: primary500,
  iconName: EIconDefaultIconName.BLOCK,
  type: EIconType.BLOCK,
  description: "Block Icon",
  isDark: false,
};

export const processIcon: IIconBuilder = {
  id: "",
  _id: "",
  shape: EIconShape.CIRCLE,
  color: primary500,
  iconName: EIconDefaultIconName.DOCUMENT_TYPE,
  type: EIconType.DOCUMENT_TYPE,
  description: "Process Icon",
  isDark: false,
};

export const stepIcon: IIconBuilder = {
  id: "",
  _id: "",
  shape: EIconShape.SQUARE,
  color: primary500,
  iconName: EIconDefaultIconName.STEP,
  type: EIconType.STEP,
  description: "Step Icon",
  isDark: false,
};

const Icon = ({ group, icon, className, ...props }: IconProps) => {
  const iconClass = `${ICON_GROUP_PREFIX[group]}-${icon}`
  return <i className={cx(iconClass, className)} {...props} />
}

export default Icon
