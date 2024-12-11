import cx from "classnames";
import Button from "components/Button";
import ModalDialog from "components/ModalDialog";
import styles from "./modalDeleteProcess.module.scss";

interface IModalConfirmProps {
  isOpen: boolean;
  toggle: () => void;
  onAccept: () => Promise<void>;
  onCancel?: () => void;
  title: string;
  content: string;
  confirmAction: string;
  isDelete?: boolean;
}

const ModalConfirm = ({
  isOpen,
  toggle,
  onAccept,
  onCancel,
  title,
  content,
  confirmAction,
  isDelete,
}: IModalConfirmProps) => {
  return (
    <ModalDialog
      isOpen={isOpen}
      headless
      className={styles.deleteDialog}
      onClose={toggle}
    >
      <h5 className={styles.title}>{title}</h5>
      <p className={styles.deleteTitle}>{content}</p>
      <div className={styles.actionButtons}>
        <Button outline onClick={onCancel ? onCancel : toggle}>
          Cancel
        </Button>
        <Button
          className={cx({
            [styles.deleteButton]: isDelete,
            [styles.primaryColor]: !isDelete,
          })}
          color="danger"
          onClick={onAccept}
        >
          {confirmAction}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default ModalConfirm;
