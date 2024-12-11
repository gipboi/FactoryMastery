import Icon from 'components/Icon'
import styles from './attachmentTag.module.scss'

interface IAttachmentTagProps {
  label: string
  deleteMode?: boolean
  onDelete?: React.EventHandler<any>
  downloadUrl?: string
}

const AttachmentTag = ({ downloadUrl, label, deleteMode = true, onDelete = () => {} }: IAttachmentTagProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Icon icon="paperclip" group="fontawesome" />
      </div>
      <div className={styles.label}>
        <a href={downloadUrl} target="_blank" rel="noreferrer">
          {label}
        </a>
      </div>
      {deleteMode && (
        <div className={styles.close}>
          <Icon icon="times" group="fontawesome" onClick={onDelete} />
        </div>
      )}
    </div>
  )
}

export default AttachmentTag
