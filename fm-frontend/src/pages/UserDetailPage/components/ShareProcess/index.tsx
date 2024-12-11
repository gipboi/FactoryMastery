import {
  Button,
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
import { getShareProcess, shareProcesses } from "API/user";
import SearchInput from "components/SearchInput";
import Spinner from "components/Spinner";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { filter } from "pages/UserDetailPage/constants";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { primary } from "themes/globalStyles";
import { getValidArray } from "utils/common";

interface IShareProcessProps {
  isOpen: boolean;
  onClose: () => void;
  afterShare: (organizationId: string) => Promise<void>;
}

const ShareProcess = (props: IShareProcessProps) => {
  const { isOpen, onClose, afterShare } = props;
  const { organizationStore, userStore } = useStores();
  const { organization } = organizationStore;
  const { userDetail } = userStore;
  const organizationId: string = organization?.id ?? "";
  const currentTheme: ITheme = organization?.theme ?? {};
  const groupIds = getValidArray(userDetail?.groupMembers).map(
    (groupMember) => groupMember.groupId
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialProcesses, setInitialProcessesProcesses] = useState<
    IProcessWithRelations[]
  >([]);
  const [filteredProcesses, setFilteredProcesses] = useState<
    IProcessWithRelations[]
  >([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function handleSelectProcess(collectionId: string): void {
    if (selectedProcessIds?.includes(collectionId)) {
      setSelectedProcessIds((prevIds) =>
        prevIds.filter((id) => id !== collectionId)
      );
    } else {
      setSelectedProcessIds((prevIds) => [...prevIds, collectionId]);
    }
  }

  function handleClose(): void {
    onClose();
    setSelectedProcessIds([]);
  }

  async function fetchData(): Promise<void> {
    setIsLoading(true);
    const shareProcesses = await getShareProcess({
      organizationId,
      userId: userDetail?.id,
      groupIds,
    });

    setInitialProcessesProcesses(getValidArray(shareProcesses));
    setFilteredProcesses(getValidArray(shareProcesses));
    setIsLoading(false);
  }

  function searchKeyword(keyword: string): void {
    if (!keyword) {
      setFilteredProcesses(initialProcesses);
      return;
    }

    setFilteredProcesses(
      initialProcesses.filter((process) =>
        process?.name?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  async function handleShareProcess(): Promise<void> {
    try {
      setIsSubmitting(true);
      if (userDetail?.id && selectedProcessIds?.length > 0) {
        await shareProcesses(userDetail?.id, selectedProcessIds);
        await userStore.getUserDetail(userDetail?.id, filter);
        await afterShare(organizationId);
      }
      handleClose();
      setIsSubmitting(false);
      toast.success("Share process successfully");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error("Share process failed");
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
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
          Share new process
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
                  onChange={(event) => searchKeyword(event.target.value)}
                />
                <Text
                  as="u"
                  minWidth="max-content"
                  fontSize="md"
                  color="gray.600"
                  cursor="pointer"
                  onClick={() => setSelectedProcessIds([])}
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
                {getValidArray(filteredProcesses).map((process) => {
                  const sharedDirectlyCollectionIds = getValidArray(
                    userDetail?.userCollections
                  ).map((userCollections) => userCollections?.collectionId);
                  // *INFO: Check if process is shared via group through collection
                  // const sharedGroupCollection = getValidArray(
                  //   process?.collectionIds
                  // ).filter((collection) =>
                  //   getValidArray(collection?.groups).some((group) =>
                  //     groupIds?.includes(group?.id ?? 0)
                  //   )
                  // );
                  // *INFO: Check if process is shared directly through collection
                  // const isContainSharedDirectlyCollection = getValidArray(
                  //   process?.collections
                  // ).some((collection) =>
                  //   sharedDirectlyCollectionIds?.includes(collection?.id)
                  // );

                  const isSharedViaGroup =
                    getValidArray(process?.groups).some((group) =>
                      groupIds?.includes(group?.id ?? "")
                    ) ||
                    //  checkValidArray(sharedGroupCollection);
                    // const isShareViaGroupOrCollection =
                    //   isSharedViaGroup
                    false ||
                    true;

                  const isChecked: boolean = selectedProcessIds?.includes(
                    process?.id
                  );

                  return (
                    <HStack
                      key={process?.id}
                      width="full"
                      spacing={0}
                      align="center"
                      opacity={true ? 0.5 : 1}
                      background={isChecked ? "primary.100" : "white"}
                      cursor={true ? "not-allowed" : "pointer"} // *INFO: Disable select process if shared via group or collection
                      _hover={{
                        background: true ? "white" : "primary.100", // *INFO: Disable hover effect if shared via group or collection
                      }}
                    >
                      {/* {!isShareViaGroupOrCollection && (
                        <Checkbox
                          margin="0 12px"
                          isChecked={isChecked}
                          onChange={() => handleSelectProcess(process?.id)}
                        />
                      )} */}
                      <HStack
                        width="full"
                        padding={2}
                        spacing={3}
                        marginLeft={true ? "40px !important" : "0"}
                        onClick={() => handleSelectProcess(process?.id)}
                      >
                        {/* <IconBuilder
                          icon={iconBuilderStore.getIconById(
                            process?.documentType?.iconId ??
                              EIconDefaultId.DOCUMENT_TYPE
                          )}
                          size={40}
                          isActive
                        /> */}
                        <Text
                          color="#313A46"
                          fontSize="14px"
                          fontWeight={500}
                          lineHeight={5}
                        >
                          {process?.name}
                        </Text>
                      </HStack>
                      {true && ( // *INFO: Display shared via group or collection
                        <Text
                          width="max-content"
                          color="gray.700"
                          fontSize="12px"
                          fontWeight="500"
                          fontStyle="italic"
                          paddingRight={2}
                        >
                          Process has been shared via group or collection
                        </Text>
                      )}
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
                isLoading={isSubmitting}
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
                background={currentTheme?.primaryColor ?? primary}
                _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
                _active={{ background: currentTheme?.primaryColor ?? primary }}
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

export default observer(ShareProcess);
