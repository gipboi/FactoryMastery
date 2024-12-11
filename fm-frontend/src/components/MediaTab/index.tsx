import { Box, HStack, Menu, MenuList, Text } from "@chakra-ui/react";
import Button from "components/Button";
import DropdownButton from "components/Dropdown/DropdownButton";
import DropdownSelection from "components/Dropdown/DropdownSelection";
import SvgIcon from "components/SvgIcon";
import { EListMediaType, EMediaTitle, MediaType, MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import EmbedLinkModal from "pages/ProcessDetailPage/components/StepCard/components/BlockTextEditor/components/EmbedLinkModal";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Col, Row } from "reactstrap";
import colors from "themes/colors.theme";
import { IDropdown } from "types/common";
import { getValidArray } from "utils/common";
import MediaCard from "./components/MediaCard";
import styles from "./mediaTab.module.scss";
import { extractMediaByType } from "./utils";

interface IMediaTabProps {
  mediaList: IMedia[];
  title?: string;
  isEditing: boolean;
  mediaType?: MediaTypeEnum;
  shownQuantity?: number;
  selectedMedia?: IMedia;
  step?: IStepWithRelations;
  isOpenEmbedLinkModal?: boolean;
  closeEmbedLinkModal?: () => void;
  setSelectedMedia?: (media: IMedia) => void;
  setShowManageMediaDialog: (show: boolean) => void;
}

const MediaTab = (props: IMediaTabProps) => {
  const {
    mediaList,
    title = EMediaTitle.MEDIA_GALLERY,
    isEditing,
    mediaType,
    shownQuantity,
    selectedMedia,
    step,
    isOpenEmbedLinkModal = false,
    closeEmbedLinkModal = () => {},
    setSelectedMedia,
    setShowManageMediaDialog,
  } = props;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [listType, setListType] = useState("ALL");
  const videoMedia: IMedia[] = extractMediaByType(mediaList, MediaTypeEnum.VIDEO);
  const imageMedia: IMedia[] = extractMediaByType(mediaList, MediaTypeEnum.IMAGE);
  const fileMedia: IMedia[] = extractMediaByType(mediaList, MediaTypeEnum.DOCUMENT);
  const embedLink: IMedia[] = extractMediaByType(
    mediaList,
    MediaTypeEnum.EMBED
  );
  const unknownMedia: IMedia[] = extractMediaByType(mediaList, MediaTypeEnum.OTHER);
  const specificMedia: IMedia[] =
    mediaType !== undefined ? extractMediaByType(mediaList, mediaType) : [];
  const [isEditingMedia, setIsEditingMedia] = useState<boolean>(false);
  const [showEmbedLinkModal, setShowEmbedLinkModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mediaFilter: { [key: string]: IMedia[] } = {
    ALL: mediaList,
    PHOTO: imageMedia,
    VIDEO: videoMedia,
    DOCUMENT: fileMedia,
    EMBED_LINK: embedLink,
    UNKNOWN: unknownMedia,
  };
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  function getMediaTypeDropdownItem(): IDropdown {
    const entries: [string, EListMediaType][] = getValidArray(
      Object.entries(EListMediaType)
    ).filter((entry: [string, EListMediaType]) => listType === entry[0]);
    return {
      title: entries?.[0]?.[1],
      value: entries?.[0]?.[1],
    };
  }

  function handleCloseEmbedLinkModal(): void {
    closeEmbedLinkModal();
    setShowEmbedLinkModal(false);
  }

  useEffect(() => {
    setSelectedMedia &&
      setSelectedMedia(mediaFilter?.[listType]?.[0] ?? ({} as IMedia));
  }, [listType]);

  useEffect(() => {
    if (!isEditing) {
      setIsEditingMedia(false);
    }
  }, [isEditing]);

  return (
    <FormProvider {...methods}>
      <Row className={styles.container}>
        <Col md="12" className={styles.column}>
          <Box
            background={mediaType === undefined ? "#EDF2F7" : "none"}
            marginX={4}
            marginBottom={4}
            borderRadius={8}
            padding={4}
          >
            {mediaType === undefined ? (
              <HStack width="full" height={8} justifyContent="space-between">
                <HStack>
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    lineHeight={4}
                    color="gray.700"
                    margin={0}
                  >
                    {title}
                  </Text>
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
                          width="140px"
                          height={8}
                          item={getMediaTypeDropdownItem()}
                          border={`1px solid ${colors.gray[200]}`}
                          fontSize="sm"
                        />
                        <MenuList
                          zIndex="1001"
                          maxWidth="140px"
                          minWidth="none"
                        >
                          {getValidArray(Object.entries(EListMediaType)).map(
                            (
                              entry: [string, EListMediaType],
                              index: number
                            ) => {
                              return (
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
                            }
                          )}
                        </MenuList>
                      </>
                    )}
                  </Menu>
                </HStack>
                <div className={styles.manageMediaButton}>
                  {isEditing && !isEditingMedia && (
                    <Button
                      onClick={() => setIsEditingMedia(true)}
                      outline
                      color="info"
                      colorScheme="info"
                      className={styles.mediaButton}
                    >
                      <SvgIcon
                        iconName="media-blue"
                        size={isMobile ? 16 : 14}
                        className={
                          isMobile ? styles.mediaIconMobile : styles.mediaIcon
                        }
                      />
                      {isMobile ? "" : "Manage Media"}
                    </Button>
                  )}
                  {isEditing && isEditingMedia && (
                    <Button
                      isLoading={isLoading}
                      onClick={() => setIsEditingMedia(false)}
                      outline
                      className={styles.saveButton}
                      _hover={{ background: "primary.700" }}
                      _active={{ background: "primary.700" }}
                    >
                      <SvgIcon
                        iconName="ic_save"
                        size={14}
                        className={
                          isMobile ? styles.mediaIconMobile : styles.mediaIcon
                        }
                      />
                      {isMobile ? "" : "Save"}
                    </Button>
                  )}
                </div>
              </HStack>
            ) : (
              <div className={styles.filterMenu}>
                <div className={styles.filterLabel}>{title}</div>
              </div>
            )}
            <MediaCard
              mediaList={
                mediaType !== undefined
                  ? specificMedia
                  : mediaFilter?.[listType] ?? []
              }
              shownQuantity={shownQuantity}
              selectedMedia={selectedMedia}
              setSelectedMedia={setSelectedMedia}
              isEditingMedia={isEditing && isEditingMedia}
              setShowManageMediaDialog={setShowManageMediaDialog}
              setShowEmbedLinkModal={setShowEmbedLinkModal}
              setIsLoading={setIsLoading}
              step={step}
            />
          </Box>
        </Col>
        <EmbedLinkModal
          isOpen={showEmbedLinkModal || isOpenEmbedLinkModal}
          onClose={handleCloseEmbedLinkModal}
          step={step}
          mediaList={mediaList}
        />
      </Row>
    </FormProvider>
  );
};

export default MediaTab;
