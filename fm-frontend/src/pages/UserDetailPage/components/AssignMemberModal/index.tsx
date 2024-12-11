import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { updateUserById } from "API/user";
import { GroupMemberPermission } from "constants/group";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import get from "lodash/get";
import { observer } from "mobx-react";
import CustomGroupPermissionInput from "pages/UserPage/components/CustomGroupPermissionInput";
import { IGroupOption } from "pages/UserPage/components/CustomGroupPermissionInput/constants";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getValidArray } from "utils/common";
import { filter } from "../../constants";
import { IGroupMember, IUpdateGroupMember } from "interfaces/groups";
import { difference, intersection } from "lodash";
import { IMemberItem } from "interfaces/user";
import { MemberTypeEnum } from "constants/enums/user";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import { updateGroupMembers } from "API/groups";

interface IAssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssignMemberModal = (props: IAssignMemberModalProps) => {
  const { isOpen, onClose } = props;

  const params = useParams();
  const userId = String(get(params, "userId", "") ?? "");

  const { userStore, organizationStore, groupStore } = useStores();
  const { organization } = organizationStore;
  const { userDetail } = userStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { groups } = groupStore;
  const groupOptions = Array.isArray(groups)
    ? groups.map((group) => ({
        groupId: group.id,
        admin: false,
      }))
    : [];

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const methods = useForm<{ groupPermissions: IGroupOption[] }>({
    reValidateMode: "onChange",
    mode: "onChange",
  });
  const { reset, control, handleSubmit } = methods;

  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  useEffect(() => {
    if (userDetail?.id) {
      reset({
        groupPermissions: getValidArray(userDetail?.groupMembers)
          ?.map((groupMember) => {
            const foundOption = groupOptions.find(
              (option) => option.groupId === groupMember.groupId
            );
            return foundOption
              ? {
                  ...foundOption,
                  admin: groupMember.admin,
                  permission: groupMember.permission,
                }
              : null;
          })
          .filter(Boolean) as { admin: boolean; groupId: string }[],
      });
    }
  }, [userDetail]);

  async function onSubmit(values: {
    groupPermissions: IGroupOption[];
  }): Promise<void> {
    setIsLoading(true);

    const listDefaultGroupsId =
      userDetail?.groupMembers?.map((groupMember) => groupMember.groupId) ?? [];
    const groupIds: string[] = getValidArray(values.groupPermissions).map(
      (groupDetail: IGroupOption) => groupDetail.groupId
    );
    const sharedGroupIds = intersection(listDefaultGroupsId, groupIds);
    const removedGroupIds = difference(listDefaultGroupsId, sharedGroupIds);
    const addedGroupIds = difference(groupIds, sharedGroupIds);

    const members: IMemberItem[] = [
      {
        admin: false,
        userId,
        memberType: MemberTypeEnum.USER,
      },
    ];

    const addedGroupMembers: IGroupMember[] = getValidArray(members)
      .map((member) => {
        return getValidArray([...sharedGroupIds, ...addedGroupIds]).map(
          (groupId) => {
            return {
              ...member,
              groupId,
              permission:
                (
                  getValidArray(values.groupPermissions).find(
                    (groupDetail: IGroupOption) =>
                      groupDetail.groupId === groupId
                  ) as any
                )?.permission ?? GroupMemberPermissionEnum.VIEWER,
            };
          }
        );
      })
      .flat();

    const toUpdateGroupMember: IUpdateGroupMember = {
      userIds: [userId],
      toRemoveGroupIds: removedGroupIds,
      toCreateGroupMembers: addedGroupMembers,
    };

    try {
      if (toUpdateGroupMember?.userIds.length > 0) {
        await toast.promise(updateGroupMembers(toUpdateGroupMember), {
          pending:
            "Assign users to group and update search index, please wait...",
          success: "Assign member successfully!",
          error:
            "Failed to assign users to group. Please try again or contact support.",
        });
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.message ??
          "Failed to assign users to group. Please try again or contact support."
      );
    } finally {
      setTimeout(async () => {
        await userStore.getUserDetail(userId ?? "", filter);
        userStore.setManageModeInUserDetail(false);
      }, 1000);
    }
  }

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={isMobile ? "auto" : "800px"}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Assign user to groups
            </ModalHeader>
            <Divider color="gray.200" margin={0} />
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody padding={6}>
              <VStack spacing={6} alignItems="flex-start">
                <CustomGroupPermissionInput
                  name="groupPermissions"
                  control={control}
                  rules={{ required: true }}
                  defaultValue={[]}
                  label=""
                  placeholder="Search groups by name"
                />
              </VStack>
            </ModalBody>
            <Divider color="gray.200" margin={0} />
            <ModalFooter>
              <Button
                marginRight={4}
                color="gray.700"
                background="white"
                fontSize="16px"
                fontWeight={500}
                lineHeight={6}
                border="1px solid #E2E8F0"
                isLoading={isLoading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                gap={{ base: 0, md: 2 }}
                padding={{ base: "10px", md: "16px" }}
                fontSize={{
                  base: "0px",
                  md: "16px",
                }}
                isLoading={isLoading}
                fontWeight="normal"
                background={currentTheme?.primaryColor ?? "primary.500"}
                _hover={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _active={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _focus={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(AssignMemberModal);
