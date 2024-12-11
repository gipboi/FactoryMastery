import { useCallback, useEffect, useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  HStack,
  InputGroup,
  InputLeftElement,
  VStack,
  Input,
  Text,
  Box,
} from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input as CustomInput, FormGroup, Label } from "reactstrap";
import { IDropdown } from "types/common";
import Dropdown from "components/Dropdown";
import { GroupMemberPermission } from "constants/group";
import { IGroup } from "interfaces/groups";
import { getValidArray } from "utils/common";
import { primary100 } from "../UserList/constants";
import userListStyles from "../UserList/userList.module.scss";
import { IGroupOption } from "./constants";
import styles from "./customGroupPermissionInput.module.scss";
import { GroupMemberPermissionEnum } from "constants/enums/group";

const CustomGroupPermissionInput = (props: any) => {
  const { name, label, placeholder } = props;
  const { groupStore } = useStores();
  const { groups } = groupStore;
  const { setValue, control, getValues } = useFormContext();
  const selectedGroups = useWatch({ name, control }) || [];

  const [groupList, setGroupList] = useState<IGroup[]>([]);
  const groupMemberPermissionOptions: IDropdown[] = [
    { title: "Viewer", value: GroupMemberPermissionEnum.VIEWER },
    { title: "Editor", value: GroupMemberPermissionEnum.EDITOR },
  ];

  const handleChange = useCallback(
    debounce((event: { target: { value: string } }) => {
      const keyword: string = event.target.value;
      const listMatchedGroup = getValidArray(groups).filter((group: IGroup) => {
        if (!keyword) return true;
        return group.name.toLowerCase().includes(keyword.toLowerCase());
      });
      setGroupList(listMatchedGroup);
    }, 300),
    []
  );

  function getCurrentPermission(id: string): IDropdown {
    const selectedGroup: IGroupOption | undefined = getValidArray(
      selectedGroups as IGroupOption[]
    ).find((selectedGroup: IGroupOption) => selectedGroup?.groupId === id);
    return selectedGroup
      ? {
          title:
            selectedGroup?.permission === GroupMemberPermissionEnum.VIEWER
              ? GroupMemberPermission.VIEWER
              : GroupMemberPermission.EDITOR,
          value: selectedGroup?.permission ?? GroupMemberPermissionEnum.VIEWER,
        }
      : {
          title: GroupMemberPermission.VIEWER,
          value: GroupMemberPermissionEnum.VIEWER,
        };
  }

  function onCheck(id: string): void {
    if (!id) return;
    if (
      getValidArray(selectedGroups as IGroupOption[]).some(
        (selectedGroup: IGroupOption) => selectedGroup?.groupId === id
      )
    ) {
      setValue(
        `${name}`,
        getValidArray(selectedGroups as IGroupOption[]).filter(
          (selectedGroup: IGroupOption) => selectedGroup.groupId !== id
        )
      );
    } else {
      setValue(`${name}`, [
        ...selectedGroups,
        {
          groupId: id,
          permission: GroupMemberPermissionEnum.VIEWER,
          admin: false,
        },
      ]);
    }
  }
  function onPermissionChange(
    id: string,
    permission: GroupMemberPermissionEnum
  ): void {
    if (!id) return;
    getValidArray(selectedGroups as IGroupOption[]).forEach(
      (selectedGroup: IGroupOption, index: number) => {
        if (selectedGroup?.groupId === id) {
          setValue(`${name}.${index}.permission`, permission);
        }
      }
    );
  }

  useEffect(() => {
    setGroupList(getValidArray(groups));
  }, [groups]);

  return (
    <VStack width="full" padding={0}>
      <HStack width="full" justifyContent="flex-start">
        {label && (
          <Text fontSize="md" color="gray.700" marginBottom={2}>
            {label}
          </Text>
        )}
      </HStack>
      <HStack justifyContent="space-between" spacing={4} width="full">
        <InputGroup borderRadius="6px" background="white">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            type="search"
            placeholder={placeholder}
            onChange={handleChange}
          />
        </InputGroup>
        <Text
          as="u"
          minWidth="max-content"
          fontSize="sm"
          color="gray.600"
          cursor="pointer"
          onClick={() => {
            setValue(`${name}`, []);
          }}
        >
          Clear all
        </Text>
      </HStack>
      <Box
        className={styles.groupList}
        width="100%"
        flexDirection="column"
        overflowY="auto"
        height="300px"
      >
        {getValidArray(groupList).map((group: IGroup, index: number) => {
          const isChecked: boolean = getValidArray(
            selectedGroups as IGroupOption[]
          ).some(
            (selectedGroup: IGroupOption) => selectedGroup?.groupId === group.id
          );
          return (
            <Box
              key={group.id}
              _hover={{ background: primary100 }}
              background={isChecked ? primary100 : "transparent"}
              paddingX={4}
              transition="0.2s ease-in-out"
              display="flex"
              alignItems="center"
            >
              <CustomInput
                name={`${name}[${index}].checkbox`}
                type="checkbox"
                id={`group-${group.id}`}
                className={cx(userListStyles.selectCheckbox, "ml-1")}
                value={group.id}
                checked={isChecked}
                onChange={() => {
                  onCheck(group.id ?? "");
                }}
              />
              <HStack
                spacing={4}
                width="full"
                justifyContent="space-between"
                height={12}
              >
                <Text
                  margin={0}
                  marginLeft={4}
                  cursor="pointer"
                  fontSize="sm"
                  onClick={() => {
                    onCheck(group.id ?? "");
                  }}
                >
                  {group.name}
                </Text>
                {isChecked && (
                  <Dropdown
                    options={groupMemberPermissionOptions}
                    name={`${name}[${index}].permission`}
                    item={getCurrentPermission(group.id ?? "")}
                    setValue={(name: string, value: IDropdown) =>
                      onPermissionChange(
                        group?.id ?? "",
                        String(value?.value) as GroupMemberPermissionEnum
                      )
                    }
                    width={100}
                    height={8}
                  />
                )}
              </HStack>
            </Box>
          );
        })}
      </Box>
    </VStack>
  );
};

export default observer(CustomGroupPermissionInput);
