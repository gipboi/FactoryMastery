import cx from "classnames";
import Button from "components/Button";
import DropdownMenu from "components/DropdownMenu";
import Icon from "components/Icon";
import ModalDialog from "components/ModalDialog";
import { observer } from "mobx-react";
import { useState } from "react";
import { DropdownItem } from "reactstrap";
import styles from "./viewOtherVersions.module.scss";

interface IViewOtherVersionsProps {
  toggle: () => void;
  isOpen: boolean;
}

const ViewOtherVersions = ({ toggle, isOpen }: IViewOtherVersionsProps) => {
  const [version, setVersion] = useState<string>("1.1");

  return (
    <ModalDialog
      headless
      className={cx(styles.viewOtherVersionsDialog)}
      isOpen={isOpen}
      onClose={toggle}
    >
      <div className="d-flex justify-content-between">
        <h4>View other versions</h4>
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
          className={cx(styles.actionButton)}
        >
          <DropdownItem onClick={() => setVersion("1.1")}>1.1</DropdownItem>
          <DropdownItem onClick={() => setVersion("2.0")}>2.0</DropdownItem>
        </DropdownMenu>
      </div>
      <div className={styles.actionButtonDialog}>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="info">View</Button>
      </div>
    </ModalDialog>
  );
};

export default observer(ViewOtherVersions);
