import cx from "classnames";
import Button from "components/Button";
import ModalDialog from "components/ModalDialog";
import { observer } from "mobx-react";
import Select from "react-select";
import styles from "./SetProcessVisibility.module.scss";

interface IEditCollaboratorsProps {
  toggle: () => void;
  isOpen: boolean;
}

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const SetProcessVisibility = ({ toggle, isOpen }: IEditCollaboratorsProps) => {
  return (
    <ModalDialog
      headless
      className={cx(styles.setProcessVisibility)}
      isOpen={isOpen}
      onClose={toggle}
    >
      <div className="d-flex justify-content-between">
        <h4>Set process visibility</h4>
      </div>
      <div className={styles.fieldWrapper}>
        <span>Select the groups who will be able to view this process</span>
        <Select
          closeMenuOnSelect={false}
          options={options}
          isMulti
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          isClearable={false}
        />
      </div>
      <div className={styles.actionBtns}>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="info" type="submit">
          Save
        </Button>
      </div>
    </ModalDialog>
  );
};

export default observer(SetProcessVisibility);
