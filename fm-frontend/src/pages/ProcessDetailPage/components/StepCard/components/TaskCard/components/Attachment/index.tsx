import SvgIcon from 'components/SvgIcon'
import styles from './attachment.module.scss'

export interface IAttachmentProps {
  label: string
  onClick?: (event: { stopPropagation: () => void }) => void
}

const Attachment = (props: IAttachmentProps) => {
  const { label, onClick } = props

  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.iconStyle}>
        <SvgIcon iconName="perm_media_black_24dp" size={20} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}

export default Attachment
