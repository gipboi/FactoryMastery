import {
  Avatar,
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
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { editCollectionProcess } from "API/collection";
import SearchInput from "components/SearchInput";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import debounce from "lodash/debounce";
import get from "lodash/get";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { getValidArray } from "utils/common";

interface IShareProcessProps {
  isOpen: boolean;
  onClose: () => void;
  afterShare?: () => Promise<void>;
}

const ShareProcessToCollectionModal = (props: IShareProcessProps) => {
  const { isOpen, onClose, afterShare } = props;
  const params = useParams();
  const { organizationStore, processStore, collectionStore } = useStores();
  // collectionStore
  const { process } = processStore;
  const { organization } = organizationStore;
  const organizationId: string = organization?.id ?? "";
  const currentTheme: ITheme = organization?.theme ?? {};
  const { collections = [], isSearching } = collectionStore;
  const processId = String(get(params, "processId", ""));
  const assignedCollectionIds = getValidArray(process?.collections).map(
    (collection) => collection.id ?? collection._id ?? ""
  );

  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    assignedCollectionIds
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchText, changeSearchText] = useState("");

  const sortedCollections = getValidArray(collections)
    .slice()
    .sort((a, b) => {
      if (assignedCollectionIds?.includes(a.id ?? "")) return -1;
      if (assignedCollectionIds?.includes(b.id ?? "")) return 1;
      return 0;
    });
  const debounceSearchGroup = debounce(changeSearchText, 500);

  function handleSelectGroup(groupId: string): void {
    if (selectedCollectionIds?.includes(groupId)) {
      setSelectedCollectionIds((prevIds) =>
        prevIds.filter((id) => id !== groupId)
      );
    } else {
      setSelectedCollectionIds((prevIds) => [...prevIds, groupId]);
    }
  }

  function handleClose(): void {
    onClose();
    setSelectedCollectionIds([]);
  }

  async function handleShareProcess(): Promise<void> {
    try {
      setIsSubmitting(true);
      await editCollectionProcess({
        processId,
        collectionIds: selectedCollectionIds,
      });
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
    collectionStore.fetchCollectionsByGroup({
      fields: { id: true, name: true, organizationId: true, updatedAt: true, mainMedia: true },
      where: {
        isVisible: true,
        $expr: {
          $eq: [
            "$organizationId",
            {
              $toObjectId: organizationId,
            },
          ],
        },
        name: searchText,
        $or: [
          { archivedAt: { $exists: false } },
          { archivedAt: { $eq: null } },
        ],
      },
      groups: []
    });
  }, [isOpen, searchText]);

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
          Add to collections
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
          {isSearching ? (
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
                  placeholder="Search collection by name"
                  onChange={(event) => debounceSearchGroup(event.target.value)}
                />
                <Text
                  as="u"
                  minWidth="max-content"
                  fontSize="md"
                  color="gray.600"
                  cursor="pointer"
                  onClick={() => setSelectedCollectionIds([])}
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
                {getValidArray(sortedCollections).map((collection) => {
                  const isChecked: boolean = selectedCollectionIds?.includes(
                    collection?.id ?? ""
                  );
                  const imageUrl = collection?.mainMedia;

                  function onClick(): void {
                    handleSelectGroup(collection?.id ?? "");
                  }
                  return (
                    <HStack
                      key={collection?.id}
                      width="full"
                      spacing={0}
                      padding={2}
                      align="center"
                      cursor="pointer"
                      background={isChecked ? "primary.100" : "white"}
                      _hover={{ background: "primary.100" }}
                    >
                      <Checkbox
                        margin="0 12px"
                        isChecked={isChecked}
                        onChange={onClick}
                      />
                      <Avatar size="xs" name={collection.name} src={imageUrl} />
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
                          {collection?.name}
                        </Text>
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            </VStack>
          )}
        </ModalBody>
        {!isSearching && (
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
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(ShareProcessToCollectionModal);
