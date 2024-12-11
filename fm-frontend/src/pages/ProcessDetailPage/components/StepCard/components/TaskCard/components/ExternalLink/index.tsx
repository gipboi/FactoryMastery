import SvgIcon from 'components/SvgIcon'
import styles from './externalLink.module.scss'

interface IExternalLinkProps {
  label: string
  onClick?: () => void
}

const ExternalLink = (props: IExternalLinkProps) => {
  const { label, onClick } = props

  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.iconStyle}>
        <SvgIcon iconName="link_black_24dp" />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}

export default ExternalLink
