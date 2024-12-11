import {
  Button,
  Checkbox,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import debounce from "lodash/debounce";
import get from "lodash/get";
import trim from "lodash/trim";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import RAvatar from "react-avatar";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
// import { shareProcessToGroups } from 'API/groupProcesses'
import SearchInput from "components/SearchInput";
import Spinner from "components/Spinner";
import { ITheme } from "interfaces/theme";
import { getValidArray } from "utils/common";
import styles from "./styles.module.scss";
import { shareProcessToGroups } from "API/groupProcesses";
import { IGroupMember } from "interfaces/groups";
import { GroupMemberPermissionEnum } from "constants/enums/group";

interface IShareProcessProps {
  isOpen: boolean;
  onClose: () => void;
  afterShare?: () => Promise<void>;
}

const ShareProcessToGroupModal = (props: IShareProcessProps) => {
  const { isOpen, onClose, afterShare } = props;
  const params = useParams();
  const { organizationStore, processStore, groupStore } = useStores();
  const { process } = processStore;
  const { organization } = organizationStore;
  const organizationId: string = organization?.id ?? "";
  const currentTheme: ITheme = organization?.theme ?? {};
  const { groups, groupMembers, isLoading } = groupStore;
  const processId = String(get(params, "processId", ""));
  const assignedGroupIds = getValidArray(process?.groups).map(
    (group) => group.id ?? ""
  );

  const [selectedGroupIds, setSelectedGroupIds] =
    useState<string[]>(assignedGroupIds);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchText, changeSearchText] = useState("");

  const sortedGroups = getValidArray(groups)
    .slice()
    .sort((a, b) => {
      if (assignedGroupIds?.includes(a.id ?? "")) return -1;
      if (assignedGroupIds?.includes(b.id ?? "")) return 1;
      return 0;
    });
  const debounceSearchGroup = debounce(changeSearchText, 500);

  function handleSelectGroup(groupId: string): void {
    if (selectedGroupIds?.includes(groupId)) {
      setSelectedGroupIds((prevIds) => prevIds.filter((id) => id !== groupId));
    } else {
      setSelectedGroupIds((prevIds) => [...prevIds, groupId]);
    }
  }

  function handleClose(): void {
    onClose();
    setSelectedGroupIds([]);
  }

  async function handleShareProcess(): Promise<void> {
    try {
      setIsSubmitting(true);
      await shareProcessToGroups(selectedGroupIds, processId);
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
    const matchGroupIds = getValidArray<IGroupMember>(groupMembers)
      .filter(
        (groupMember: IGroupMember) =>
          (groupMember?.permission ?? GroupMemberPermissionEnum.VIEWER) ===
          GroupMemberPermissionEnum.EDITOR
      )
      .map((groupMember: IGroupMember) => groupMember?.groupId);

    groupStore.getGroups({
      fields: ["name", "id"],
      where: {
        organizationId,
        _id: { $in: matchGroupIds },
        name: { $regex: trim(searchText), $options: "i" },
      },
    });
  }, [isOpen, searchText, groupMembers]);

  useEffect(() => {
    groupStore.fetchGroupMemberOfCurrentUser();
  }, []);

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
          Share process with groups
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
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
              <HStack width="full">
                <SearchInput
                  placeholder="Search process by name"
                  onChange={(event) => debounceSearchGroup(event.target.value)}
                />
                <Text
                  as="u"
                  minWidth="max-content"
                  fontSize="md"
                  color="gray.600"
                  cursor="pointer"
                  onClick={() => setSelectedGroupIds([])}
                >
                  Clear all
                </Text>
              </HStack>
              <VStack
                width="full"
                maxHeight="368px"
                overflowY="scroll"
                alignItems="flex-start"
                background="gray.50"
                paddingY={2}
                spacing={0}
              >
                {getValidArray(sortedGroups).map((group) => {
                  const isChecked: boolean = selectedGroupIds?.includes(
                    group?.id ?? ""
                  );
                  function onClick(): void {
                    handleSelectGroup(group?.id ?? "");
                  }
                  return (
                    <HStack
                      key={group?.id}
                      width="full"
                      spacing={0}
                      padding={2}
                      align="center"
                      cursor="pointer"
                      background={isChecked ? "primary.100" : "transparent"}
                      _hover={{ background: "primary.100" }}
                      transition={"background 0.3s"}
                    >
                      <Checkbox
                        margin="0 12px"
                        isChecked={isChecked}
                        onChange={onClick}
                      />
                      <RAvatar
                        name={group?.name}
                        className={styles.avatar}
                        maxInitials={2}
                      />
                      <HStack
                        width="full"
                        padding={2}
                        spacing={3}
                        onClick={onClick}
                      >
                        <Text
                          color="#313A46"
                          fontSize="14px"
                          fontWeight={500}
                          lineHeight={5}
                        >
                          {group?.name}
                        </Text>
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
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
                onClick={handleShareProcess}
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
      </ModalContent>
    </Modal>
  );
};

export default observer(ShareProcessToGroupModal);
