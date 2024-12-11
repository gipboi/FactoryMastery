import cx from "classnames";
import Button from "components/Button";
import ModalDialog from "components/ModalDialog";
import TextField from "components/TextField";
import { observer } from "mobx-react";
import { useState } from "react";
import styles from "./createNewDraft.module.scss";

interface ICreateNewDraft {
  toggle: () => void;
  isOpen: boolean;
}

const CreateNewDraft = ({ toggle, isOpen }: ICreateNewDraft) => {
  const [newVersion, setNewVersion] = useState<string>("");

  return (
    <ModalDialog
      headless
      className={cx(styles.createNewDraft)}
      isOpen={isOpen}
      onClose={toggle}
    >
      <div className="d-flex justify-content-between">
        <h4>Create a new draft</h4>
      </div>
      <div className={styles.container}>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua.{" "}
        </p>
      </div>
      <div className={styles.fieldWrapper}>
        <span>Set new version number for draft</span>
        <TextField
          className={styles.inputField}
          value={newVersion}
          onChange={(event: { currentTarget: { value: string } }) =>
            setNewVersion(event.currentTarget.value)
          }
        />
      </div>
      <div className={styles.actionButtonWrapper}>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="info" type="submit">
          Start Draft
        </Button>
      </div>
    </ModalDialog>
  );
};

export default observer(CreateNewDraft);
