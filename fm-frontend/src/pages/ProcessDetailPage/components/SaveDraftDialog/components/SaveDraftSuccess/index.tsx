import cx from "classnames";
import Button from "components/Button";
import ModalDialog from "components/ModalDialog";
import SvgIcon from "components/SvgIcon";
import { observer } from "mobx-react";
import styles from "./SaveDraftSuccess.module.scss";

interface ISaveDraftSuccessDialogProps {
  toggle: () => void;
  isOpen: boolean;
}

const SaveDraftSuccess = ({ toggle, isOpen }: ISaveDraftSuccessDialogProps) => {
  return (
    <ModalDialog
      headless
      className={cx(styles.SaveDraftSuccess)}
      isOpen={isOpen}
      onClose={toggle}
    >
      <div className={styles.container}>
        <SvgIcon size={48} iconName="success-ico" />
        <p>Your draft has been saved</p>
      </div>
      <div className={styles.actionButton}>
        <Button color="light" onClick={toggle}>
          Continue
        </Button>
      </div>
    </ModalDialog>
  );
};

export default observer(SaveDraftSuccess);
