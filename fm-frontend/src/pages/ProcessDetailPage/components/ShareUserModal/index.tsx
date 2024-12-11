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
// import { shareProcessToUsers } from "API/process";
// import ShareUserDropdown from "components/Pages/CollectionsPage/ShareUserDropdown";
// import { filterValueInArray } from "components/Pages/UserPage/UserListFilterDialog/utils";
import Spinner from "components/Spinner";
import SvgIcon from "components/SvgIcon";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { IUser } from "interfaces/user";
import get from "lodash/get";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
import { IOption } from "types/common/select";
import { getValidArray } from "utils/common";
import ShareUserDropdown from "../ShareUserDropdown";
import { getOptionSelect } from "components/FormDropdown/utils";
import { filterValueInArray } from "pages/UserPage/components/UserListFilterDialog/utils";
import { shareProcessToUsers } from "API/process";

interface IShareProcessToUserProps {
  isOpen: boolean;
  onClose: () => void;
  afterShare?: () => Promise<void>;
}

const ShareProcessToUserModal = (props: IShareProcessToUserProps) => {
  const { isOpen, onClose, afterShare } = props;
  const params = useParams();
  const { organizationStore, processStore, userStore } = useStores();
  const { organization } = organizationStore;
  const organizationId: string = organization?.id ?? "";
  const currentTheme: ITheme = organization?.theme ?? {};
  const { users, isLoading } = userStore;
  const { process } = processStore;
  const processId = String(get(params, "processId", ""));

  const methods = useForm();
  const { handleSubmit } = methods;

  const [userOptions, setUserOptions] = useState<IOption<string>[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sharedViaGroupUsers, setSharedViaGroupUsers] = useState<IUser[]>([]);

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

  function handleClose(): void {
    onClose();
  }

  async function handleShareProcess(): Promise<void> {
    try {
      setIsSubmitting(true);
      const userIds: string[] = getValidArray(selectedUsers).map(
        (selectedUser) => String(selectedUser?.value)
      );
      await shareProcessToUsers(processId, userIds);
      handleClose();
      afterShare && (await afterShare());
      setIsSubmitting(false);
      toast.success("Shared successfully");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error("Shared failed");
    }
  }

  useEffect(() => {
    const processGroupIds = getValidArray(process?.groups).map(
      (group) => group?.id
    );
    const sharedViaGroupUsers: IUser[] = getValidArray(users).filter((user) =>
      getValidArray(user?.groupMembers).find((groupMember) =>
        processGroupIds?.includes(groupMember?.groupId)
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
      getValidArray(process?.userProcesses).find(
        (userProcess) => user?.id === userProcess?.userId
      )
    );

    setSelectedUsers(getOptionSelect(sharedUsers));
    setUserOptions(getOptionSelect(users));
  }, [users]);

  useEffect(() => {
    userStore.getUsers({
      where: {
        organizationId,
        // isInactive: false,
        authRole: AuthRoleNameEnum.BASIC_USER,
      },
      include: ["groupMembers"],
    });
  }, [isOpen]);

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxWidth="600px" borderRadius={8}>
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          fontWeight={500}
          lineHeight={7}
        >
          Share process with users
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleShareProcess)}>
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
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    border="0"
                    color="white"
                    fontSize="16px"
                    fontWeight={500}
                    lineHeight={6}
                    isLoading={isSubmitting}
                    background={currentTheme?.primaryColor ?? primary500}
                    _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
                    _active={{
                      background: currentTheme?.primaryColor ?? primary500,
                    }}
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

export default observer(ShareProcessToUserModal);
