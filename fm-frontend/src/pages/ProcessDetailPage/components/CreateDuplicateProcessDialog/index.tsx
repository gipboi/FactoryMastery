import cx from "classnames";
import Button from "components/Button";
import DropdownMenu from "components/DropdownMenu";
import Icon from "components/Icon";
import ModalDialog from "components/ModalDialog";
import { observer } from "mobx-react";
import { useState } from "react";
import { DropdownItem } from "reactstrap";
import styles from "./createDuplicateProcessDialog.module.scss";

interface ICreateDuplicateProcessDialogProps {
  toggle: () => void;
  isOpen: boolean;
}

const CreateDuplicateProcessDialog = ({
  toggle,
  isOpen,
}: ICreateDuplicateProcessDialogProps) => {
  const [version, setversion] = useState<string>("1.1");

  return (
    <ModalDialog
      headless
      className={cx(styles.createDuplicateProcessDialog)}
      isOpen={isOpen}
      onClose={toggle}
    >
      <div className="d-flex justify-content-between">
        <h4>Create a duplicate of this process</h4>
      </div>
      <div className={styles.container}>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua.{" "}
        </p>
      </div>
      <div className={styles.fieldWrapper}>
        <span>Select version</span>
        <DropdownMenu
          color="info"
          placeholder={version}
          customCaret={
            <Icon
              group="fontawesome"
              icon="chevron-down"
              className={styles.caret}
            />
          }
          className={cx(styles.actionsButton)}
        >
          <DropdownItem onClick={() => setversion("1.1")}>1.1</DropdownItem>
          <DropdownItem onClick={() => setversion("2.0")}>2.0</DropdownItem>
        </DropdownMenu>
      </div>
      <div className={styles.actionButtonWrapper}>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="info" type="submit">
          Duplicate
        </Button>
      </div>
    </ModalDialog>
  );
};

export default observer(CreateDuplicateProcessDialog);
