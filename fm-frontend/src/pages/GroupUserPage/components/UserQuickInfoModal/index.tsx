import {
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import cx from "classnames";
import Avatar from "components/Avatar";
import Icon from "components/Icon";
import { useStores } from "hooks/useStores";
import { IGroup, IGroupMember } from "interfaces/groups";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { getFullName, getName } from "utils/user";
import styles from "./userQuickInfoModal.module.scss";
import PermissionTag from "../PermissionTag";

interface IUserQuickInfoModalProps {
  toggle: () => void;
  isOpen: boolean;
  selectedMember?: IGroupMember;
}

const UserQuickInfoModal = (props: IUserQuickInfoModalProps) => {
  const { toggle, isOpen, selectedMember } = props;
  const userId = selectedMember?.member?.id;
  const { userStore } = useStores();
  const { selectedUserDetail } = userStore;
  const avatarUrl = selectedUserDetail?.image ?? "";
  const members = selectedUserDetail?.groupMembers ?? [];
  const groups = members?.map(
    (member) => (member?.group as IGroup[])?.[0]?.name ?? ""
  );

  useEffect(() => {
    if (userId) {
      const filter = {
        include: [
          {
            relation: "groupMembers",
            scope: { include: [{ relation: "group" }] },
          },
        ],
      };
      userStore.getUserDetail(userId ?? 0, filter, true);
    }
  }, [userId]);

  return (
    <Modal isOpen={isOpen} onClose={toggle}>
      <ModalOverlay />
      <ModalContent
        borderRadius={8}
        marginTop={0}
        containerProps={{ alignItems: "center" }}
      >
        <div className={styles.overviewHeader}>
          <div className={styles.nameWrapper}>
            <h1 className={styles.header}>{getName(selectedUserDetail)}</h1>
          </div>
          <button onClick={toggle}>
            <Icon icon="multiply" group="unicon" />
          </button>
        </div>

        <ModalBody className={styles.modalWrapper}>
          <hr className={styles.separator} />
          <HStack alignItems="flex-start">
            <VStack>
              <HStack>
                <Avatar
                  src={avatarUrl}
                  name={getName(selectedUserDetail)}
                  className={styles.avatar}
                />
              </HStack>
            </VStack>
            <VStack alignItems="flex-start" paddingLeft="20px">
              <HStack className={cx(styles.info, styles.noPaddingTop)}>
                <VStack>
                  <strong>Permission</strong>
                </VStack>
                <VStack>
                  <PermissionTag role={selectedMember?.permission ?? ""} />
                </VStack>
              </HStack>
              <HStack className={styles.info}>
                <VStack>
                  <strong>Full Name</strong>
                </VStack>
                <VStack>
                  <span>
                    {getFullName(
                      selectedUserDetail?.firstName,
                      selectedUserDetail?.lastName
                    ) ?? ""}
                  </span>
                </VStack>
              </HStack>
              <HStack className={styles.info}>
                <VStack>
                  <strong>Username</strong>
                </VStack>
                <VStack>
                  <span>{selectedUserDetail?.username ?? ""}</span>
                </VStack>
              </HStack>
              <HStack className={styles.info}>
                <VStack>
                  <strong>Email</strong>
                </VStack>
                <VStack>
                  <span>{selectedUserDetail?.email ?? ""}</span>
                </VStack>
              </HStack>
              {groups?.length ? (
                <VStack className={styles.info}>
                  <HStack>
                    <strong>Groups</strong>
                  </HStack>
                  <HStack className={styles.col}>
                    {groups
                      .filter((group) => !!group)
                      .map((group) => (
                        <span className={styles.groupTag}>{group}</span>
                      ))}
                  </HStack>
                </VStack>
              ) : null}
            </VStack>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(UserQuickInfoModal);
