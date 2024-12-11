import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  HStack,
  VStack,
  Box,
  Grid,
  GridItem,
  Link,
  Text,
} from "@chakra-ui/react";
import RAvatar from "react-avatar";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { useStores } from "../../../../hooks/useStores";
import { ITheme } from "../../../../interfaces/theme";
import { primary, primary500 } from "../../../../themes/globalStyles";
import styles from "../../styles.module.scss";
import { IGroup, IGroupMember } from "interfaces/groups";
import { getValidArray } from "utils/common";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal?: () => void;
  group: IGroup;
  hideCollection?: boolean;
}

const DetailModal = ({
  isOpen,
  onClose,
  group,
  onOpenEditModal,
  hideCollection,
}: IDetailModalProps) => {
  const navigate = useNavigate();

  const params = new URLSearchParams();
  const { organizationStore, groupStore, userStore } = useStores();
  const { organization } = organizationStore;
  const { currentUser } = userStore;
  const { groupMembers } = groupStore;
  const isBasicUser: boolean =
    currentUser?.authRole === AuthRoleNameEnum.BASIC_USER;
  const foundGroupMember: IGroupMember | undefined = getValidArray(
    groupMembers
  ).find((groupMember) => groupMember.groupId === group.id);
  const isEditorOfGroup: boolean =
    !isBasicUser ||
    (!!foundGroupMember &&
      foundGroupMember?.permission == GroupMemberPermissionEnum.EDITOR);

  function handleOnClose() {
    onClose();
  }

  function openCollectionInGroup() {
    if (group?.id) {
      params.set("groups", String(group.id));
      navigate(`${routes.collections.value}?${params.toString()}`);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} size="2xl">
      <ModalOverlay />
      <ModalContent
        borderRadius={8}
        marginTop={0}
        containerProps={{ alignItems: "center" }}
      >
        <ModalHeader
          fontSize="18px"
          lineHeight={7}
          fontWeight="500"
          color="gray.800"
        >
          Group Summary
        </ModalHeader>
        <ModalCloseButton
          width="40px"
          height="40px"
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
          onClick={onClose}
        />
        <ModalBody border="1px solid #E2E8F0" padding={6}>
          <VStack spacing={6} width="full">
            <HStack
              justifyContent="flex-start"
              width="full"
              alignItems="center"
            >
              <RAvatar
                name={group?.name}
                className={styles.avatar}
                maxInitials={2}
              />
              <Text fontSize="lg">{group?.name ?? ""}</Text>
            </HStack>
            <Grid templateColumns="150px minmax(0, 1fr)" gap={4} width="full">
              <GridItem colSpan={1}>
                <Box fontWeight="600">Description</Box>
              </GridItem>
              <GridItem colSpan={1}>
                <Box display="flex" flexWrap="wrap" alignSelf="center">
                  {group?.description ?? ""}
                </Box>
              </GridItem>
              <GridItem colSpan={1}>
                <Box fontWeight="600">Users</Box>
              </GridItem>
              <GridItem colSpan={1}>
                <Box display="flex" flexWrap="wrap" alignSelf="center">
                  <span>{group?.numberOfMembers ?? 0} members</span>
                  <Link
                    onClick={() =>
                      navigate(`${routes.groups.groupId.value(`${group?.id}`)}`)
                    }
                    // style={{ marginLeft: 8, color: currentTheme?.primaryColor ?? primary, cursor: 'pointer' }}
                    style={{
                      marginLeft: 8,
                      color: primary500,
                      cursor: "pointer",
                    }}
                  >
                    View all
                  </Link>
                </Box>
              </GridItem>
              {!hideCollection && (
                <>
                  <GridItem colSpan={1}>
                    <Box fontWeight="600">Collections</Box>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <Box display="flex" flexWrap="wrap" alignSelf="center">
                      <span>{group?.numberOfCollections ?? 0} collections</span>
                      <Link
                        onClick={openCollectionInGroup}
                        // style={{ marginLeft: 8, color: currentTheme?.primaryColor ?? primary, cursor: 'pointer' }}
                        style={{
                          marginLeft: 8,
                          color: primary500,
                          cursor: "pointer",
                        }}
                      >
                        View all
                      </Link>
                    </Box>
                  </GridItem>
                </>
              )}
            </Grid>
          </VStack>
        </ModalBody>
        {onOpenEditModal && (
          <ModalFooter>
            <HStack justifyContent="flex-start" width="full">
              <HStack spacing={4} justifyContent="center" width="full">
                <Button
                  paddingY={2}
                  paddingX={4}
                  outline="unset"
                  border="unset"
                  color="white"
                  background="primary.500"
                  // backgroundColor={currentTheme?.primaryColor ?? primary}
                  _hover={{ opacity: 0.8 }}
                  _focus={{ opacity: 1 }}
                  _active={{ opacity: 1 }}
                  borderRadius="6px"
                  fontWeight={500}
                  fontSize="16px"
                  lineHeight="24px"
                  type="submit"
                  disabled={!isEditorOfGroup}
                  onClick={() => {
                    handleOnClose();
                    onOpenEditModal();
                  }}
                >
                  Edit group
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
export default DetailModal;
