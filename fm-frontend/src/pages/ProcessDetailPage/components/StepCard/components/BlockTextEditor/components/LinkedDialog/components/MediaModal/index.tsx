/* eslint-disable max-lines */
import { Search2Icon } from "@chakra-ui/icons";
import {
  Center,
  Divider,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { primary, primary500 } from "themes/globalStyles";
import { IDropdown } from "types/common";
// import { deleteMediaById } from 'API/media'
import Button from "components/Button";
import DropdownButton from "components/Dropdown/DropdownButton";
import DropdownSelection from "components/Dropdown/DropdownSelection";
import MediaThumbnail from "components/MediaThumbnail";
import SvgIcon from "components/SvgIcon";
import { EListMediaType, MediaType, MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";
import { checkValidArray, getValidArray } from "utils/common";
import CustomButton from "../../../../../CustomButton";
import UploadMediaModal from "../../../../../UploadMediaModal";
import { extractMediaByType, handleClickMedia } from "../../utils";
import MoreOption from "../MoreOption";
import styles from "./medialModal.module.scss";
import { deleteMediaById } from "API/media";

interface IMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: IStepWithRelations;
  linkedMedia?: IMedia[];
  setLinkedMedia?: (linkedMedia: IMedia[]) => void;
  handleShowManageMediaDialog: () => void;
  handleShowEmbedLinkModal: () => void;
  handleSave: () => void;
}

const MediaModal = (props: IMediaModalProps) => {
  const {
    isOpen,
    onClose,
    step,
    linkedMedia = [],
    setLinkedMedia = () => {},
    handleShowEmbedLinkModal,
    handleSave,
  } = props;
  const { organizationStore, processStore } = useStores();
  const { organization } = organizationStore;
  const organizationId: string = organization?.id ?? "";
  const currentTheme: ITheme = organization?.theme ?? {};
  const mediaList: IMedia[] = getValidArray(step?.media);
  const [listType, setListType] = useState("ALL");
  const [searchMedia, setSearchMedia] = useState<IMedia[]>(mediaList);
  const [isDeletingMedia, setIsDeletingMedia] = useState<boolean>(false);
  const videoMedia: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.VIDEO
  );
  const imageMedia: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.IMAGE
  );
  const fileMedia: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.DOCUMENT
  );
  const embedLink: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.EMBED
  );
  const unknownMedia: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.OTHER
  );
  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);
  const {
    isOpen: isOpenUploadModal,
    onOpen: onOpenUploadModal,
    onClose: onCloseUploadModal,
  } = useDisclosure();

  const mediaFilter: { [key: string]: IMedia[] } = {
    ALL: mediaList,
    PHOTO: imageMedia,
    VIDEO: videoMedia,
    DOCUMENT: fileMedia,
    EMBED_LINK: embedLink,
    UNKNOWN: unknownMedia,
  };

  const handleChange = useCallback(
    debounce((event: { target: { value: string } }) => {
      const keyword: string = event?.target?.value?.toLowerCase();
      const listMatchedMedia: IMedia[] = getValidArray(step?.media).filter(
        (media: IMedia) => {
          return (
            (!media?.name && !keyword) ||
            (media?.name ?? media?.originalFile)
              ?.toLowerCase()
              .includes(keyword)
          );
        }
      );
      setSearchMedia(listMatchedMedia);
    }, 1000),
    []
  );

  function handleClose(): void {
    onClose();
    setSearchMedia(getValidArray(step?.media));
  }

  function handleSelect(): void {
    onClose();
    handleSave();
  }

  function getMediaTypeDropdownItem(): IDropdown {
    const entries: [string, EListMediaType][] = getValidArray(
      Object.entries(EListMediaType)
    ).filter((entry: [string, EListMediaType]) => listType === entry[0]);
    return {
      title: entries?.[0]?.[1],
      value: entries?.[0]?.[1],
    };
  }

  async function handleDeleteMedia(id: string): Promise<void> {
    try {
      setIsDeletingMedia(true);
      await deleteMediaById(id);
      await getRenderProcess(processStore.process?.id ?? "", processStore);
      const newLinkedMedia: IMedia[] = linkedMedia?.filter(
        (media: IMedia) => media?.id !== id
      );
      setLinkedMedia(newLinkedMedia);
      setIsDeletingMedia(false);
      toast.success("Delete media successfully");
    } catch (error: any) {
      toast.error("Delete media failed");
    }
  }

  function onClickMedia(media: IMedia): void {
    handleClickMedia(media, linkedMedia, setLinkedMedia);
  }

  useEffect(() => {
    setSearchMedia(mediaFilter?.[listType]);
  }, [listType]);

  useEffect(() => {
    setSearchMedia(getValidArray(step?.media));
  }, [step?.media]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent minWidth={isTablet ? "auto" : "800px"}>
        <ModalHeader
          fontSize="lg"
          fontWeight={500}
          lineHeight={7}
          color="gray.800"
        >
          Media Gallery
        </ModalHeader>
        <Divider color="gray.200" margin={0} />
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody padding={6}>
          <HStack>
            <InputGroup
              borderRadius="6px"
              background="white"
              display={{ md: "block" }}
            >
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                type="search"
                placeholder="Search by name"
                onChange={handleChange}
              />
            </InputGroup>
            <Menu
              closeOnSelect={true}
              autoSelect={false}
              computePositionOnMount
              matchWidth
            >
              {({ isOpen }) => (
                <>
                  <DropdownButton
                    isOpen={isOpen}
                    width="180px"
                    height={10}
                    fontSize="sm"
                    border="1px solid #E2E8F0"
                    item={getMediaTypeDropdownItem()}
                  />
                  <MenuList
                    zIndex="1001"
                    maxWidth="140px"
                    minWidth="none"
                    border="1px solid #E2E8F0"
                  >
                    {getValidArray(Object.entries(EListMediaType)).map(
                      (entry: [string, EListMediaType], index: number) => (
                        <DropdownSelection
                          key={`option-${index}`}
                          onClick={() => setListType(entry[0])}
                          label={`${entry[1]}`}
                          isSelected={listType === entry[0]}
                          width="100%"
                          height={9}
                          fontSize="sm"
                        />
                      )
                    )}
                  </MenuList>
                </>
              )}
            </Menu>
          </HStack>
          <HStack width="full" marginTop={4}>
            <Button
              className={styles.mediaButton}
              outline
              color="white"
              colorScheme="info"
              onClick={onOpenUploadModal}
            >
              <SvgIcon
                iconName="file-upload"
                size={14}
                color={currentTheme?.primaryColor ?? primary500}
              />
              Upload files
            </Button>
            <Button
              className={styles.mediaButton}
              outline
              color="white"
              colorScheme="info"
              onClick={handleShowEmbedLinkModal}
            >
              <SvgIcon
                iconName="insert-link"
                size={14}
                color={currentTheme?.primaryColor ?? primary500}
              />
              Embed link
            </Button>
          </HStack>
          {checkValidArray(mediaList) ? (
            <SimpleGrid
              className={styles.collectionLayout}
              width="100%"
              gap={4}
              columns={{ base: 1, sm: 2, lg: 4 }}
            >
              {getValidArray(searchMedia).map(
                (media: IMedia, index: number) => (
                  <GridItem
                    key={`grid-media-${media.id}-${index}`}
                    width="full"
                    height="180px"
                    padding={2}
                    borderRadius={8}
                    position="relative"
                    background={
                      linkedMedia?.findIndex(
                        (mediaElement: IMedia) =>
                          (mediaElement?._id ?? mediaElement?.id) ===
                          (media?._id ?? media?.id)
                      ) > -1
                        ? "#DBF8FF"
                        : "#F4FCFF"
                    }
                    border={
                      linkedMedia?.findIndex(
                        (mediaElement: IMedia) =>
                          (mediaElement?._id ?? mediaElement?.id) ===
                          (media?._id ?? media?.id)
                      ) > -1
                        ? "2px solid #00A9EB"
                        : "1px solid #E2E8F0"
                    }
                  >
                    <VStack width="full" height="full" spacing={1.5}>
                      <HStack width="full" spacing={0}>
                        <Text
                          width="full"
                          color="black"
                          fontSize="xs"
                          fontWeight={500}
                          lineHeight={4}
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {media?.name ?? media?.originalFile}
                        </Text>
                        <MoreOption
                          media={media}
                          handleDeleteMedia={handleDeleteMedia}
                        />
                      </HStack>
                      <Center
                        width="166px"
                        height="140px"
                        onClick={() => onClickMedia(media)}
                      >
                        <MediaThumbnail media={media} />
                      </Center>
                    </VStack>
                  </GridItem>
                )
              )}
            </SimpleGrid>
          ) : (
            <Text color="gray.500" textAlign="center" marginY="142px">
              No media here. Upload now.
            </Text>
          )}
        </ModalBody>
        <Divider color="gray.200" margin={0} />
        <ModalFooter>
          <CustomButton
            content="Cancel"
            className="outline"
            onClick={handleClose}
            isLoading={isDeletingMedia}
          />
          <CustomButton
            content="Select media"
            className="primary"
            onClick={handleSelect}
            isLoading={isDeletingMedia}
          />
        </ModalFooter>
      </ModalContent>
      <UploadMediaModal
        step={step}
        isOpen={isOpenUploadModal}
        onClose={onCloseUploadModal}
        organizationId={organizationId}
        fetchData={() =>
          getRenderProcess(processStore.process?.id ?? "", processStore)
        }
      />
    </Modal>
  );
};

export default observer(MediaModal);
