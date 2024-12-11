import { IGroupOption } from "components/EditAccountModal/utils";
import Icon from "components/Icon";
import DropdownInput from "components/Inputs/DropdownInput";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useController, useWatch } from "react-hook-form";
import { MdPeople as PeopleIcon } from "react-icons/md";
import Select from "react-select";
import { Col, Row } from "reactstrap";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import styles from "./groupPermissionInput.module.scss";

const GroupPermissionInput = (props: any) => {
  const { groupStore } = useStores();
  const { groups } = groupStore;
  const groupOptions = Array.isArray(groups)
    ? groups.map((group) => ({
        label: group.name,
        value: group.id,
        permission: GroupMemberPermissionEnum.VIEWER,
      }))
    : [];
  const selectedGroups =
    useWatch<IGroupOption[]>({ name: props.name, control: props.control }) ||
    [];
  const { field } = useController(props);

  const groupMemberPermissionOptions = [
    { label: "Viewer", value: GroupMemberPermissionEnum.VIEWER },
    { label: "Editor", value: GroupMemberPermissionEnum.EDITOR },
  ];

  function updateGroupPermission(
    id: string,
    permission: GroupMemberPermissionEnum
  ): void {
    // @ts-ignore - this is a bug in react-hook-form
    getValidArray<IGroupOption>(selectedGroups).forEach(
      (selectedGroup: IGroupOption) => {
        if (selectedGroup.value.toString() === id) {
          selectedGroup.permission = permission;
          selectedGroup.admin = permission === GroupMemberPermissionEnum.EDITOR;
        }
      }
    );
    field.onChange(selectedGroups);
  }

  function removeGroup(id: string): void {
    // @ts-ignore - this is a bug in react-hook-form
    const newGroupIds = getValidArray<IGroupOption>(selectedGroups).filter(
      (selectedGroup: IGroupOption) => selectedGroup.value !== id
    );
    field.onChange(newGroupIds);
  }

  return (
    <Row className={styles.container}>
      <Col md={12}>
        <div className={styles.fieldWrapper}>
          <label>Group Permission *</label>
          <Select
            isMulti
            options={groupOptions}
            {...field}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
              MultiValueContainer: () => null,
              ClearIndicator: () => null,
            }}
            placeholder="Search group..."
          />
        </div>
        <div className={styles.groupList}>
          {Array.isArray(selectedGroups) &&
            selectedGroups.map((group: any) => {
              const defaultPermission =
                group?.permissionId === GroupMemberPermissionEnum.EDITOR
                  ? groupMemberPermissionOptions[1]
                  : groupMemberPermissionOptions[0];

              return (
                <div className={styles.itemWrapper} key={group?.value}>
                  <div className={styles.nameWrapper}>
                    <div className={styles.iconWrapper}>
                      <PeopleIcon />
                    </div>{" "}
                    <span>{group?.label}</span>
                  </div>
                  <div className={styles.rightSide}>
                    <DropdownInput
                      containerClassName={styles.permissionDropdown}
                      options={groupMemberPermissionOptions}
                      components={{ IndicatorSeparator: null }}
                      defaultValue={defaultPermission}
                      // @ts-ignore
                      onChange={(newValue: IOption<string>) => {
                        updateGroupPermission(
                          group.value,
                          newValue.value as unknown as GroupMemberPermissionEnum
                        );
                      }}
                      isSearchable={false}
                    />
                    <div
                      className={styles.deleteIconWrapper}
                      onClick={() => {
                        removeGroup(group?.value ?? 0);
                      }}
                    >
                      <Icon icon="trash-alt" group="fontawesome" />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Col>
    </Row>
  );
};

export default observer(GroupPermissionInput);
