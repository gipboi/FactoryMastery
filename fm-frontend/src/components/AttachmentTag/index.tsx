import Icon from 'components/Icon'
import { useStores } from 'hooks/useStores'
import { ITheme } from 'interfaces/theme'
import { primary } from 'themes/globalStyles'
import styles from './attachmentTag.module.scss'

interface IAttachmentTagProps {
  label: string
  deleteMode?: boolean
  onDelete?: React.EventHandler<any>
  downloadUrl?: string
}

const AttachmentTag = ({ downloadUrl, label, deleteMode = true, onDelete = () => {} }: IAttachmentTagProps) => {
  const { organizationStore } = useStores()
  const { organization } = organizationStore
  const currentTheme: ITheme = organization?.theme ?? {}
  return (
    <div className={styles.container}>
      <div className={styles.icon} style={{ color: currentTheme?.primaryColor ?? primary }}>
        <Icon icon="paperclip" group="fontawesome" />
      </div>
      <div className={styles.label}>
        <a href={downloadUrl} target="_blank" rel="noreferrer" style={{ color: currentTheme?.primaryColor ?? primary }}>
          {label}
        </a>
      </div>
      {deleteMode && (
        <div className={styles.close}>
          <Icon icon="times" group="fontawesome" onClick={onDelete} />
        </div>
      )}
    </div>
  );
};

export default AttachmentTag
