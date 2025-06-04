import { updateCollection } from "API/collection";
import { deleteGroupById } from "API/groups";
import cx from "classnames";
import Button from "components/Button";
import DeleteDialog from "components/DeleteDialog";
import ModalDialog, { ModalDialogProps } from "components/ModalDialog";
import TextField from "components/TextField";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { useStores } from "hooks/useStores";
import { IGroup, IGroupMember } from "interfaces/groups";
import { ITheme } from "interfaces/theme";
import { isString } from "lodash";
import debounce from "lodash/debounce";
import isNumber from "lodash/isNumber";
import set from "lodash/set";
import trim from "lodash/trim";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { primary } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import GroupOption from "./components/GroupOption";
import styles from "./shareWithGroupsDialog.module.scss";

interface IShareWithGroupsDialogProps
  extends Omit<ModalDialogProps, "headless"> {
  isEdit?: boolean;
  refetch?: () => void;
  isBasicUser?: boolean;
  toggle: () => void;
}

const ShareWithGroupsDialog = ({
  className,
  isEdit,
  refetch,
  isBasicUser,
  toggle,
  ...props
}: IShareWithGroupsDialogProps) => {
  const { groupStore, processStore, organizationStore, collectionStore } =
    useStores();
  const { newProcessGroupIds } = processStore;
  const { collection } = collectionStore;
  const { organization } = organizationStore;
  const { groups, groupMembers } = groupStore;
  // const currentTheme: ITheme = organization?.theme ?? {}
  const currentTheme: ITheme = {};
  const [selectedGroupIds, setSelectedGroupIds] = useState(
    newProcessGroupIds
      ? getValidArray<IGroup>(collection?.groups)
          .map((group) => group?.id ?? "")
          .filter((id) => id > "")
      : []
  );

  const [searchText, changeSearchText] = useState("");
  const [deleteGroupId, setDeleteGroupId] = useState("");
  const filterGroup = {
    fields: ["name", "id"],
    where: {
      organizationId: organization?.id ?? "",
      name: { $regex: trim(searchText), $options: "i" },
    },
  };
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const groupId = params.get("groupId") || "";

  useEffect(() => {
    if (groupId && isString(groupId)) {
      processStore.setNewProcessGroupIds([groupId]);
      setSelectedGroupIds([groupId]);
    }
  }, [groupId]);

  useEffect(() => {
    if (isEdit) {
      const collectionGroups = collection?.groups ?? [];
      const groupIds = collectionGroups.map((group) => group.id) || [];
      const defaultGroupIds: string[] = [];
      // eslint-disable-next-line array-callback-return
      groupIds.map((id) => {
        if (isNumber(id)) {
          defaultGroupIds.push(id);
        }
      });
      setSelectedGroupIds(defaultGroupIds);
    }
  }, [isEdit, collection]);

  useEffect(() => {
    if (isBasicUser) {
      set(filterGroup.where, "id", {
        inq: getValidArray<IGroupMember>(groupMembers)
          .filter(
            (groupMember: IGroupMember) =>
              String(
                groupMember?.permission ?? GroupMemberPermissionEnum.VIEWER
              ) < GroupMemberPermissionEnum.VIEWER
          )
          .map((groupMember: IGroupMember) => groupMember.groupId),
      });
    }
    groupStore.getGroups(filterGroup);
  }, [searchText, groupMembers, isBasicUser]);

  function toggleGroup(id: string): void {
    if (selectedGroupIds.includes(id)) {
      const newGroupIds = selectedGroupIds.filter(
        (selectedId) => selectedId !== id
      );
      setSelectedGroupIds(newGroupIds);
    } else {
      setSelectedGroupIds([...selectedGroupIds, id]);
    }
  }

  function handleCancel(): void {
    !isEdit && setSelectedGroupIds([]);
    // props.toggle();
    toggle();
  }

  async function handleDeleteGroupConfirmed(): Promise<void> {
    if (deleteGroupId) {
      setDeleteGroupId("");
      await deleteGroupById(deleteGroupId);
      groupStore.getGroups(filterGroup);
    }
  }

  const debounceSearchGroup = debounce(changeSearchText, 500);

  return (
    <ModalDialog
      headless
      className={cx(styles.shareGroupDialog, className)}
      {...props}
    >
      <div className="d-flex justify-content-between">
        <h4>Share with groups</h4>
      </div>
      <div className={styles.fieldWrapper}>
        <TextField
          placeholder="Search groups"
          onChange={(event: { currentTarget: { value: string } }) => {
            debounceSearchGroup(event.currentTarget.value);
          }}
        />
      </div>
      <div className={styles.groupList}>
        {Array.isArray(groups) &&
          groups.map((group) => {
            const isSelected = selectedGroupIds.includes(String(group?.id));
            return (
              <GroupOption
                key={group?.id}
                isSelected={isSelected}
                group={group}
                toggleGroup={toggleGroup}
                setDeleteGroupId={setDeleteGroupId}
              />
            );
          })}
      </div>
      <div className={styles.actionBtns}>
        <Button color="light" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          color="info"
          backgroundColor={currentTheme?.primaryColor ?? primary}
          _hover={{ opacity: 0.8 }}
          _focus={{ opacity: 1 }}
          _active={{ opacity: 1 }}
          onClick={async () => {
            if (collection?.id && refetch) {
              // INFO update if the collection haven't been fetched
              await updateCollection(
                {
                  groupIds: selectedGroupIds,
                },
                collection.id
              );
              refetch();
              toast.success("Update shared groups successfully");
            } else {
              // INFO update later in the collection detail
              processStore.setNewProcessGroupIds(selectedGroupIds);
            }
            // props.toggle();
            toggle();
          }}
        >
          Save
        </Button>
      </div>
      <DeleteDialog
        title="Delete Group"
        isOpen={deleteGroupId > ""}
        message="Are you sure you want to DELETE this group?"
        toggle={() => setDeleteGroupId("")}
        onDelete={handleDeleteGroupConfirmed}
        onCancel={() => setDeleteGroupId("")}
      />
    </ModalDialog>
  );
};

export default observer(ShareWithGroupsDialog);
