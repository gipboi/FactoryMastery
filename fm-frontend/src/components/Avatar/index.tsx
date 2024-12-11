import cx from 'classnames'
import RAvatar from 'react-avatar'
import styles from './avatar.module.scss'

interface IAvatarProps {
  name: string
  src?: string
  className?: string
  isLarge?: boolean
}

const Avatar = (props: IAvatarProps) => {
  const { src, name, className, isLarge } = props

  return src ? (
    <img src={src} className={cx(styles.avatar, className, { [styles.large]: isLarge })} alt="avatar" />
  ) : (
    <RAvatar name={name} className={cx(styles.avatar, className, { [styles.large]: isLarge })} maxInitials={2} />
  )
}

export default Avatar
