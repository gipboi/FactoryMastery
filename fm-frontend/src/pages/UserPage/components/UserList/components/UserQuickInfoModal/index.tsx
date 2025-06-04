import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  HStack,
  VStack,
  Avatar,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import { IGroup, IGroupMember } from "interfaces/groups";
import { IUserWithRelations } from "interfaces/user";
import { getValidArray, getValidDefaultArray } from "utils/common";
import { getFullName, getName } from "utils/user";
import UserTypeTag from "../UserTypeTag";
import UserDetailRow from "./components/UserDetailRow";
import styles from "./userQuickInfoModal.module.scss";
import UserStatusTag from "../UserStatusTag";
import CustomButton from "pages/UserPage/components/CustomButton";
import { ReactComponent as OutlineMessageIcon } from "assets/icons/outline-message.svg";

interface IUserQuickInfoModalProps {
  toggle: () => void;
  isOpen: boolean;
  setOpenEditModal: (isOpen: boolean) => void;
  setOpenMessageModal: (isOpen: boolean) => void;
  user?: IUserWithRelations;
}

const UserQuickInfoModal = (props: IUserQuickInfoModalProps) => {
  const { toggle, isOpen, user, setOpenEditModal, setOpenMessageModal } = props;
  const { userStore } = useStores();
  const { currentUser, selectedUserDetail } = userStore;
  const currentUserRole: string = currentUser?.authRole ?? "";
  const selectedUserRole: string = user?.authRole ?? "";
  const avatarUrl: string = user?.image ?? "";
  const members: IGroupMember[] = selectedUserDetail?.groupMembers ?? [];
  const groups: string[] = members?.map((member) => (getValidDefaultArray(member?.group as any) as IGroup[])?.[0]?.name ?? '');
  const showEdit: boolean =
    currentUserRole < selectedUserRole || user?.id === currentUser?.id;
  const isHideSendMessage: boolean =
    (currentUserRole === AuthRoleNameEnum.BASIC_USER &&
      selectedUserRole === AuthRoleNameEnum.BASIC_USER) ||
    currentUser?.id === user?.id;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  useEffect(() => {
    if (isOpen) {
      const filter = {
        include: [
          {
            relation: "groupMembers",
            scope: { include: [{ relation: "group" }] },
          },
        ],
      };
      userStore.getUserDetail(user?.id ?? "", filter, true);
    }
  }, [isOpen]);

  function handleOpenMessageModal(): void {
    setOpenMessageModal(true);
    toggle();
  }

  function handleOpenEditModal(): void {
    setOpenEditModal(true);
    toggle();
  }

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
      <ModalOverlay />
      <ModalContent minWidth={isMobile ? "auto" : "600px"}>
        <ModalHeader
          fontSize="lg"
          fontWeight={500}
          lineHeight={7}
          color="gray.800"
        >
          User
        </ModalHeader>
        <Divider color="gray.200" margin={0} />
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody padding={6}>
          <VStack spacing={6}>
            <HStack spacing={4} width="full" justifyContent="space-between">
              <HStack>
                <Avatar src={avatarUrl} name={getName(user)} size="lg" />
                <VStack spacing={1} alignItems="flex-start" height="64px">
                  <Text
                    margin={0}
                    color="gray.700"
                    fontSize="lg"
                    fontWeight="600"
                    lineHeight={7}
                  >
                    {getFullName(user?.firstName, user?.lastName) ?? ""}
                  </Text>
                  <Text
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="400"
                    lineHeight={5}
                  >
                    {user?.email ?? ""}
                  </Text>
                </VStack>
              </HStack>
              {!isHideSendMessage && (
                <HStack alignItems="flex-start" height="64px">
                  <CustomButton
                    content={isMobile ? '' : 'Send message'}
                    className="outline"
                    color="gray.700"
                    fontSize="sm"
                    height={8}
                    leftIcon={<OutlineMessageIcon width={14} height={14} />}
                    disabled
                    onClick={handleOpenMessageModal}
                  />
                </HStack>
              )}
            </HStack>
            <VStack spacing={6} alignItems="flex-start" width="full">
              <UserDetailRow
                label="User Name"
                textContent={user?.username ?? ""}
              />
              <UserDetailRow
                label="User Type"
                children={
                  <UserTypeTag
                    role={
                      (user?.authRole ??
                        AuthRoleNameEnum.BASIC_USER) as AuthRoleNameEnum
                    }
                  />
                }
              />
              <UserDetailRow
                label="Email Address"
                textContent={user?.email ?? ""}
              />
              <UserDetailRow
                label="Last Login"
                textContent={dayjs(user?.currentSignInAt).format(
                  "MMMM DD, YYYY"
                )}
              />
              <UserDetailRow
                label="User Status"
                children={
                  <UserStatusTag
                    disabled={user?.disabled}
                    deleted={user?.disabled}
                  />
                }
              />
              <UserDetailRow
                label="Groups"
                children={
                  <HStack
                    spacing={2}
                    flexWrap="wrap"
                    display="flex"
                    className={styles.col}
                  >
                    {getValidArray(groups).map(
                      (group: string, index: number) => (
                        <Text
                          key={index}
                          border="1px solid"
                          borderColor="gray.200"
                          color="gray.700"
                          fontSize="sm"
                          borderRadius="6px"
                          background="gray.50"
                          paddingX={2}
                          paddingY={1}
                          margin={0}
                          className={styles.groupTag}
                        >
                          {group}
                        </Text>
                      )
                    )}
                  </HStack>
                }
              />
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(UserQuickInfoModal);
