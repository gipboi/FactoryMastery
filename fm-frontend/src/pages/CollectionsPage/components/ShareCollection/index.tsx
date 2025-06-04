/* eslint-disable max-lines */
import {
  Button,
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { handleError } from "API";
import { updateCollection } from "API/collection";
import CustomInputDropdown from "components/CustomInputDropdown";
import { getOptionSelect } from "components/FormDropdown/utils";
import Spinner from "components/Spinner";
import SvgIcon from "components/SvgIcon";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleIdEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { IGroup, IGroupMember } from "interfaces/groups";
import { IUser } from "interfaces/user";
import set from "lodash/set";
import {
  filterValueInArray,
  getGroupOptionSelect,
} from "pages/GroupPage/components/GroupFilterDialog/utils";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import ShareUserDropdown from "../ShareUserDropdown";
import { ICollectionsGroup } from "interfaces/collection";

interface IUserCollection {
  userId: string;
}

interface IShareCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  isBasicUser: boolean;
  isBulkShare: boolean;
  onSubmitBulkShare: (groupIds: string[]) => void;
}

const ShareCollection = (props: IShareCollectionProps) => {
  const {
    isOpen,
    onClose,
    collectionId,
    isBasicUser,
    isBulkShare,
    onSubmitBulkShare,
  } = props;
  const { authStore, collectionStore, groupStore, userStore } = useStores();
  const { users } = userStore;
  const { collection } = collectionStore;
  const { groups, groupMembers } = groupStore;
  const organizationId: string = authStore.userDetail?.organizationId ?? "";
  const [userOptions, setUserOptions] = useState<IOption<string>[]>([]);
  const [groupOptions, setGroupOptions] = useState<IOption<string>[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const [sharedViaGroupUsers, setSharedViaGroupUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const methods = useForm();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  function handleSelectGroups(value: string): void {
    const chosenGroup: IOption<string> | undefined = getValidArray(
      groupOptions
    ).find((option: IOption<string>) => option?.value === value);
    if (chosenGroup) {
      setSelectedGroups([...selectedGroups, chosenGroup]);
    }
  }

  function removeSelectedGroup(value: string): void {
    const removedGroup: IOption<string> | undefined = getValidArray(
      selectedGroups
    ).find((option: IOption<string>) => option?.value === value);
    if (removedGroup) {
      const remainGroups: IOption<string>[] = filterValueInArray(
        value,
        selectedGroups
      );
      setSelectedGroups(remainGroups);
    }
  }

  function handleSelectUsers(value: string): void {
    if (sharedViaGroupUsers?.some((user) => String(user?.id) === value)) {
      return;
    }
    const chosenUser: IOption<string> | undefined = getValidArray(
      userOptions
    ).find((option: IOption<string>) => option?.value === value);
    if (chosenUser) {
      setSelectedUsers([...selectedUsers, chosenUser]);
    }
  }

  function removeSelectedUser(value: string): void {
    const removedUser: IOption<string> | undefined = getValidArray(
      selectedUsers
    ).find((option: IOption<string>) => option?.value === value);
    if (removedUser) {
      const remainUsers: IOption<string>[] = filterValueInArray(
        value,
        selectedUsers
      );
      setSelectedUsers(remainUsers);
    }
  }

  async function fetchData(): Promise<void> {
    setIsLoading(true);
    if (!isBulkShare) {
      await collectionStore.getCollectDetail(collectionId);
    }
    const filterGroup = {
      where: { organizationId },
    };
    if (isBasicUser) {
      set(filterGroup.where, "id", {
        inq: getValidArray<IGroupMember>(groupMembers)
          .filter(
            (groupMember: IGroupMember) =>
              String(
                groupMember?.permission ?? GroupMemberPermissionEnum.VIEWER
              ) < GroupMemberPermissionEnum.VIEWER
          )
          .map((groupMember: IGroupMember) => groupMember?.groupId),
      });
    }
    await Promise.all([
      groupStore.getGroups(filterGroup),
      userStore.getUsers({
        where: {
          organizationId,
          // isInactive: false,
          authRole: AuthRoleIdEnum.BASIC_USER,
        },
        include: ["groupMembers"],
      }),
    ]);
    setIsLoading(false);
  }

  async function onSubmit(): Promise<void> {
    try {
      const groupIds: string[] = getValidArray(selectedGroups).map(
        (selectedGroup) => String(selectedGroup?.value)
      );
      const userIds: string[] = getValidArray(selectedUsers).map(
        (selectedUser) => String(selectedUser?.value)
      );
      if (isBulkShare) {
        await onSubmitBulkShare(groupIds);
      } else {
        await updateCollection({ groupIds, userIds }, collection?.id ?? "");
        toast.success("Share collections successfully");
      }
      onClose();
    } catch (error: any) {
      handleError(
        error as Error,
        "components/Pages/CollectionsPage/ShareCollection",
        "onSubmit"
      );
      toast.error("Share collections failed");
      onClose();
    }
  }

  useEffect(() => {
    const remainGroups: IGroup[] = getValidArray(groups).filter(
      (group: IGroup) =>
        !getValidArray(selectedGroups).find(
          (option: IOption<string>) => option?.value === String(group?.id)
        )
    );
    setGroupOptions(getGroupOptionSelect(remainGroups));
  }, [selectedGroups]);

  useEffect(() => {
    if (isBulkShare) {
      setSelectedGroups([]);
    } else {
      const selectedGroups: IGroup[] = getValidArray(collection?.collectionGroups)
        .filter(collectionGroup => getValidArray(groups).some((group: IGroup) => group.id === collectionGroup?.group?.id))
        .map(collectionGroup => collectionGroup?.group)
        .filter(x => !!x) ?? [];

      setSelectedGroups(getGroupOptionSelect(selectedGroups));
    }
    setGroupOptions(getGroupOptionSelect(groups));
  }, [collection, groups]);

  useEffect(() => {
    const collectionGroupIds = getValidArray(collection?.groups).map(
      (group) => group?.id
    );
    const sharedViaGroupUsers: IUser[] = getValidArray(users).filter((user) =>
      getValidArray(user?.groupMembers).find((groupMember) =>
        collectionGroupIds?.includes(groupMember?.groupId)
      )
    );
    setSharedViaGroupUsers(sharedViaGroupUsers);

    const remainUsers: IUser[] = getValidArray(users).filter(
      (user: IUser) =>
        !getValidArray(selectedUsers).find(
          (option: IOption<string>) => option?.value === String(user?.id)
        )
    );
    setUserOptions(getOptionSelect(remainUsers));
  }, [selectedUsers]);

  useEffect(() => {
    const sharedUsers: IUser[] = getValidArray(users).filter((user: IUser) =>
      getValidArray(collection?.userCollections).find(
        (userCollection) => user?.id === userCollection?.userId
      )
    );
    setSelectedUsers(getOptionSelect(sharedUsers));
    setUserOptions(getOptionSelect(users));
  }, [collection, users]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="600px" borderRadius={8}>
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          fontWeight={500}
          lineHeight={7}
        >
          Share Collections
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
              {isLoading ? (
                <Spinner />
              ) : (
                <VStack
                  width="full"
                  minHeight="200px"
                  alignItems="flex-start"
                  spacing={3}
                >
                  <CustomInputDropdown
                    name="groups"
                    label="Select group to share"
                    placeholder="Search group by name"
                    optionsData={groupOptions}
                    chooseOptionsHandler={handleSelectGroups}
                  />
                  <Wrap>
                    {getValidArray(selectedGroups).map((group) => (
                      <Tag
                        key={group?.value}
                        size="lg"
                        gap={1}
                        color="gray.700"
                        border="1px solid #E2E8F0"
                      >
                        {group?.label}
                        <SvgIcon
                          iconName="ic_baseline-close"
                          size={12}
                          cursor="pointer"
                          onClick={() => removeSelectedGroup(group?.value)}
                        />
                      </Tag>
                    ))}
                    {getValidArray(selectedGroups)?.length > 0 && (
                      <Center>
                        <Text
                          as="u"
                          fontSize="md"
                          color="gray.600"
                          cursor="pointer"
                          onClick={() => setSelectedGroups([])}
                        >
                          Clear all
                        </Text>
                      </Center>
                    )}
                  </Wrap>
                  {!isBasicUser && !isBulkShare && (
                    <>
                      <ShareUserDropdown
                        name="users"
                        label="Select user to share"
                        placeholder="Search user by name"
                        optionsData={userOptions}
                        chooseOptionsHandler={handleSelectUsers}
                        sharedViaGroupUsers={sharedViaGroupUsers}
                      />
                      <Wrap>
                        {getValidArray(selectedUsers).map((user) => (
                          <Tag
                            key={user?.value}
                            size="lg"
                            gap={1}
                            color="gray.700"
                            border="1px solid #E2E8F0"
                          >
                            {user?.label}
                            <SvgIcon
                              iconName="ic_baseline-close"
                              size={12}
                              cursor="pointer"
                              onClick={() => removeSelectedUser(user?.value)}
                            />
                          </Tag>
                        ))}
                        {getValidArray(selectedUsers)?.length > 0 && (
                          <Center>
                            <Text
                              as="u"
                              fontSize="md"
                              color="gray.600"
                              cursor="pointer"
                              onClick={() => setSelectedUsers([])}
                            >
                              Clear all
                            </Text>
                          </Center>
                        )}
                      </Wrap>
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            {!isLoading && (
              <ModalFooter borderTop="1px solid #E2E8F0">
                <HStack width="full" justifyContent="flex-end" spacing={4}>
                  <Button
                    color="gray.700"
                    background="white"
                    fontSize="16px"
                    fontWeight={500}
                    lineHeight={6}
                    border="1px solid #E2E8F0"
                    isLoading={isSubmitting}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    border="0"
                    color="white"
                    background="primary.500"
                    fontSize="16px"
                    fontWeight={500}
                    lineHeight={6}
                    isLoading={isSubmitting}
                    _hover={{ background: "primary.700" }}
                    _active={{ background: "primary.700" }}
                  >
                    Share
                  </Button>
                </HStack>
              </ModalFooter>
            )}
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default ShareCollection;
