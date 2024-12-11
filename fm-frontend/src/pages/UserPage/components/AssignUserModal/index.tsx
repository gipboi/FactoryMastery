import React, { useCallback, useEffect, useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  Text,
  Box,
  ModalFooter,
} from "@chakra-ui/react";
import cx from "classnames";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import compact from "lodash/compact";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import {
  FormProvider,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { Input as CustomInput } from "reactstrap";
import { IDropdown } from "types/common";
import Dropdown from "components/Dropdown";
import GlobalSpinner from "components/GlobalSpinner";
import { GroupMemberPermission } from "constants/group";
import { EBreakPoint } from "constants/theme";
import { IGroup, IGroupMember } from "interfaces/groups";
import { IUserWithRelations } from "interfaces/user";
import { getValidArray } from "utils/common";
import CustomButton from "../CustomButton";
import { primary100 } from "../UserList/constants";
import userListStyles from "../UserList/userList.module.scss";
import {
  EAssignUserForm,
  IAssignUserForm,
  IAssignUserGroupForm,
  IGroupForm,
} from "./contants";
import styles from "./assignUserModal.module.scss";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { getGroups } from "API/groups";

interface IAssignUserModalProps {
  defaultValues?: IGroupForm;
  toggle: () => void;
  isOpen: boolean;
  onSubmit: (values: IGroupForm) => Promise<void>;
  isAssignSingleUser?: boolean;
  user?: IUserWithRelations;
}

const AssignUserModal = (props: IAssignUserModalProps) => {
  const { defaultValues, onSubmit, toggle, isOpen, isAssignSingleUser, user } =
    props;
  const { groupStore, organizationStore } = useStores();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { groups, isLoading: isGettingGroupList } = groupStore;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const methods: UseFormReturn<IAssignUserForm> = useForm<IAssignUserForm>();
  const { setValue, control } = methods;
  const userGroup: IAssignUserGroupForm[] = useWatch({
    control,
    name: EAssignUserForm.USER_GROUP,
  });

  const [groupList, setGroupList] = useState<IGroup[]>(groups);

  useEffect(() => {
    if (!isAssignSingleUser) {
      const defaultGroupIds: string[] =
        defaultValues?.groupDetails.map((groupDetail) => groupDetail.groupId) ??
        [];
      setSelectedGroups(defaultGroupIds);
    } else {
      const defaultGroupIds: string[] = getValidArray(user?.groupMembers).map(
        (member: IGroupMember) => member.groupId
      );
      getValidArray(groups).forEach((group: IGroup, index: number) => {
        setValue(
          `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.GROUP_ID}`,
          group?.id ?? ""
        );

        const mappedGroup: IGroupMember =
          getValidArray(user?.groupMembers).find(
            (member: IGroupMember) => member.groupId === group.id
          ) ?? ({} as IGroupMember);
        const permission: GroupMemberPermissionEnum =
          mappedGroup?.permission ?? GroupMemberPermissionEnum.VIEWER;
        setValue(
          `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.PERMISSION}`,
          {
            title: permission,
            value: mappedGroup.permission ?? GroupMemberPermissionEnum.VIEWER,
          }
        );

        if (defaultGroupIds.includes(group?.id ?? "")) {
          setValue(
            `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.CHECK_BOX}`,
            true
          );
        } else {
          setValue(
            `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.CHECK_BOX}`,
            false
          );
        }
      });
      setSelectedGroups(defaultGroupIds);
    }
    setGroupList(groups);
    if (!isOpen) {
      setSelectedGroups([]);
    } else {
      groupStore.fetchGroupList();
    }
  }, [isOpen]);

  useEffect(() => {
    setGroupList(groups);
  }, [groups]);

  function onCheck(id: string, index: number): void {
    if (!id) return;
    if (selectedGroups.includes(id)) {
      setValue(
        `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.CHECK_BOX}`,
        false
      );
      setSelectedGroups((prevGroups) =>
        prevGroups.filter((group: string) => group !== id)
      );
    } else {
      setValue(
        `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.CHECK_BOX}`,
        true
      );
      setSelectedGroups((prevGroups) => [...prevGroups, id]);
    }
  }
  async function handleSubmit(): Promise<void> {
    setIsLoading(true);
    let values: IGroupForm;

    if (isAssignSingleUser) {
      values = {
        groupDetails:
          compact(
            getValidArray(userGroup).map((item: IAssignUserGroupForm) => {
              if (item?.checkBox) {
                return {
                  groupId: item?.groupId ?? "",
                  permission:
                    String(item?.permission?.value) ??
                    GroupMemberPermissionEnum.VIEWER,
                };
              }
              return null;
            })
          ) ?? [],
      };
    } else {
      values = {
        groupDetails: getValidArray(selectedGroups).map((groupId: string) => {
          return {
            groupId,
          };
        }),
      };
    }
    await onSubmit(values);
    setIsLoading(false);
  }
  function getPermissionItems(): IDropdown[] {
    return getValidArray(Object.keys(GroupMemberPermission)).map(
      (key: string) => {
        const value: GroupMemberPermission =
          GroupMemberPermission[key as keyof typeof GroupMemberPermission] ??
          GroupMemberPermission.VIEWER;
        return {
          title: value,
          value:
            value === GroupMemberPermission.VIEWER
              ? GroupMemberPermissionEnum.VIEWER
              : GroupMemberPermissionEnum.EDITOR,
        };
      }
    );
  }
  function getCurrentPermission(index: number): IDropdown {
    return (
      userGroup?.[index]?.permission ?? {
        title: GroupMemberPermission.VIEWER,
        value: GroupMemberPermissionEnum.VIEWER,
      }
    );
  }
  const handleChange = useCallback(
    debounce(async (event: { target: { value: string } }) => {
      const keyword: string = event.target.value;
      const searchData = await getGroups({
        where: {
          organizationId: organizationStore?.organization?.id ?? "",
          name: { $regex: keyword, $options: "i" },
        },
      });
      const listMatchedGroup = searchData;
      setGroupList(listMatchedGroup);
    }, 300),
    []
  );

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
      <FormProvider {...methods}>
        <ModalOverlay />
        <ModalContent minWidth={isMobile ? "auto" : "800px"}>
          <ModalHeader
            fontSize="lg"
            fontWeight={500}
            lineHeight={7}
            color="gray.800"
          >
            Assign Users to Group
          </ModalHeader>
          <Divider color="gray.200" margin={0} />
          <ModalCloseButton
            background="white"
            border="none"
            boxShadow="none !important"
          />
          <ModalBody padding={6}>
            {isGettingGroupList ? (
              <div className="d-flex align-items-center justify-content-center p-5">
                <GlobalSpinner />
              </div>
            ) : (
              <VStack width="full">
                <HStack justifyContent="space-between" spacing={4} width="full">
                  <InputGroup borderRadius="6px" background="white">
                    <InputLeftElement pointerEvents="none">
                      <Search2Icon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="search"
                      placeholder="Search groups by name"
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
                      setSelectedGroups([]);
                      setValue(`${EAssignUserForm.USER_GROUP}`, []);
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
                >
                  {getValidArray(groupList).map(
                    ({ id, name }: IGroup, index: number) => {
                      const isChecked: boolean = id
                        ? selectedGroups.includes(id)
                        : false;
                      return (
                        <Box
                          key={id}
                          _hover={{ background: primary100 }}
                          paddingX={4}
                          transition="0.2s ease-in-out"
                          display="flex"
                          alignItems="center"
                        >
                          <CustomInput
                            name={`${EAssignUserForm.USER_GROUP}[${index}].${EAssignUserForm.CHECK_BOX}`}
                            type="checkbox"
                            id={`group-${id}`}
                            className={cx(
                              userListStyles.selectCheckbox,
                              "ml-1"
                            )}
                            value={id}
                            checked={isChecked}
                            onChange={() => onCheck(id ?? "", index)}
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
                              onClick={() => onCheck(id ?? "", index)}
                            >
                              {name}
                            </Text>
                            {isChecked && isAssignSingleUser && (
                              <Dropdown
                                options={getPermissionItems()}
                                name={`${EAssignUserForm.USER_GROUP}[${index}].${EAssignUserForm.PERMISSION}`}
                                item={getCurrentPermission(index)}
                                setValue={(name: string, value: IDropdown) =>
                                  setValue(
                                    `${EAssignUserForm.USER_GROUP}.${index}.${EAssignUserForm.PERMISSION}`,
                                    value
                                  )
                                }
                                width={100}
                                height={8}
                              />
                            )}
                          </HStack>
                        </Box>
                      );
                    }
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <Divider color="gray.200" margin={0} />
          <ModalFooter>
            <CustomButton
              content="Cancel"
              className="outline"
              onClick={toggle}
              isLoading={isLoading}
            />
            <CustomButton
              content="Save"
              className={"primary-override"}
              onClick={handleSubmit}
              isLoading={isLoading}
            />
          </ModalFooter>
        </ModalContent>
      </FormProvider>
    </Modal>
  );
};

export default observer(AssignUserModal);
