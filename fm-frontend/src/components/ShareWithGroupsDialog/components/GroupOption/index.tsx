import { CheckIcon } from "@chakra-ui/icons";
import cx from "classnames";
import Icon from "components/Icon";
import { IGroup } from "interfaces/groups";
import { MdPeople as PeopleIcon } from "react-icons/md";
import styles from "../../shareWithGroupsDialog.module.scss";

interface IGroupOptionProps {
  group: IGroup;
  isSelected?: boolean;
  toggleGroup: (id: string) => void;
  setDeleteGroupId: (id: string) => void;
}

const GroupOption = (props: IGroupOptionProps) => {
  const { toggleGroup, setDeleteGroupId, group, isSelected } = props;

  return (
    <div
      className={cx(styles.itemWrapper, { [styles.selectedItem]: isSelected })}
    >
      <div
        className={styles.nameWrapper}
        onClick={() => {
          toggleGroup(String(group.id));
        }}
      >
        <div className={styles.iconWrapper}>
          <PeopleIcon />
        </div>{" "}
        <span>{group.name}</span>
        {isSelected && <CheckIcon className={styles.checkIcon} />}{" "}
      </div>
      <Icon
        icon="trash-alt"
        group="fontawesome"
        onClick={() => {
          setDeleteGroupId(group.id ?? "");
        }}
      />
    </div>
  );
};

export default GroupOption;
