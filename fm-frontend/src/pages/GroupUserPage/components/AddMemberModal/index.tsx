import {
  Button,
  Divider,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";

import { addGroupMembers } from "API/groups";
import FilterSelect from "components/FilterSelect";
import { GroupMemberPermission } from "constants/group";
import { ITheme } from "interfaces/theme";
import { IUser } from "interfaces/user";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { loadUserOptions } from "./utils";
import ChakraFormRadioGroup from "components/ChakraFormRadioGroup";
import MultiSelectFilter from "components/MultiSelectFilter";
import CustomButton from "pages/UserPage/components/CustomButton";
import { allPermissionOptions } from "./constant";
import { getUserOptionSelect } from "pages/GroupPage/components/GroupFilterDialog/utils";
import { useEffect, useState } from "react";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { observer } from "mobx-react";
import useBreakPoint from "hooks/useBreakPoint";
import { EBreakPoint } from "constants/theme";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
}

interface IGroupForm {
  members: IOption<string>[];
  role: GroupMemberPermissionEnum;
}

const AddMemberModal = ({ isOpen, onClose, reloadData }: IDetailModalProps) => {
  const { organizationStore, userStore, groupStore } = useStores();
  const { organization } = organizationStore;
  const organizationId = organization?.id;
  const currentTheme: ITheme = organization?.theme ?? {};
  const params = useParams();
  const groupId = String(get(params, "groupId", ""));
  const method = useForm<IGroupForm>({
    defaultValues: { role: GroupMemberPermissionEnum.VIEWER },
  });
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);
  const currentMemberIds = getValidArray(groupStore?.groupMembersDetail).map(
    (groupMember) => groupMember?.member?.id
  );
  const listUsers = getValidArray(userStore?.users)?.filter(
    (user) => !currentMemberIds?.includes(user?._id ?? user?.id)
  );
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
    setValue,
    getValues,
    control,
  } = method;
  const members: IOption<string>[] = useWatch({ name: "members", control });

  function handleOnClose() {
    onClose();
    reset({});
  }

  async function onSubmit(data: IGroupForm): Promise<void> {
    if (!organizationId) {
      toast.error("Organization not found");
    }
    try {
      await addGroupMembers(
        getValidArray(data?.members).map((member) => ({
          userId: get(member, "value", "") as string,
          permission:
            data?.role === GroupMemberPermissionEnum.VIEWER
              ? GroupMemberPermissionEnum.VIEWER
              : GroupMemberPermissionEnum.EDITOR,
          groupId,
        }))
      );
      handleOnClose();
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        reloadData();
      }, 1000);
    }
  }

  function clearAllUsers(): void {
    setSelectedUsers([]);
    setValue("members", []);
  }

  useEffect(() => {
    reset({
      members: [],
      role: GroupMemberPermissionEnum.VIEWER,
    });
    if (isOpen) {
      userStore.getUsers({ where: { organizationId } });
    }
  }, [isOpen, organizationId]);

  useEffect(
    function handleUserState(): void {
      if (members) {
        const remainUsers: IUser[] = listUsers.filter(
          (user: IUser) =>
            !getValidArray(members).find(
              (option: IOption<string>) => option?.value === String(user?.id)
            )
        );
        setSelectedUsers(members);
      }
    },
    [members]
  );

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleOnClose}>
      <FormProvider {...method}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={!isMobile ? "600px" : "auto"}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Add members to group
            </ModalHeader>
            <Divider color="gray.200" margin={0} />
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody padding={6}>
              <VStack width="full" spacing={4}>
                <VStack width="full" alignItems="center" spacing={6}>
                  <MultiSelectFilter
                    name="members"
                    label="Users"
                    placeholder="Search users by name"
                    options={getUserOptionSelect(listUsers)}
                    selectedData={selectedUsers}
                    clearAllHandler={clearAllUsers}
                  />
                </VStack>
                <VStack width="full">
                  <ChakraFormRadioGroup
                    name="role"
                    label="User Permissions"
                    optionsData={allPermissionOptions}
                    reverseRow
                  />
                </VStack>
              </VStack>
            </ModalBody>
            <Divider color="gray.200" margin={0} />
            <ModalFooter>
              <HStack justifyContent="space-between" width="full">
                <HStack width="full" justifyContent={"flex-end"}>
                  <CustomButton
                    content="Cancel"
                    className="outline"
                    onClick={handleOnClose}
                    isLoading={isSubmitting}
                  />
                  <CustomButton
                    className={"primary-override"}
                    content="Add"
                    type="submit"
                    isLoading={isSubmitting}
                  />
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};
export default observer(AddMemberModal);
