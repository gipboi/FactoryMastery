import { Menu, MenuList, VStack } from "@chakra-ui/react";
import DropdownButton from "components/Dropdown/DropdownButton";
import DropdownSelection from "components/Dropdown/DropdownSelection";
import SvgIcon from "components/SvgIcon";
import {
  EListMediaType,
  EMediaTitle,
  MediaType,
  MediaTypeEnum,
} from "constants/media";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import EmbedLinkModal from "pages/ProcessDetailPage/components/StepCard/components/BlockTextEditor/components/EmbedLinkModal";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Col, Row } from "reactstrap";
import colors from "themes/colors.theme";
import { primary, primary500 } from "themes/globalStyles";
import { IDropdown } from "types/common";
import { checkValidArray, getValidArray } from "utils/common";
import MediaCard from "./components/MediaCard";
import {
  OutlineButton,
  SaveButton,
} from "./components/MediaCard/mediaCard.styles";
import styles from "./mediaTab.module.scss";
import { extractMediaByType } from "./utils";

interface IMediaTabProps {
  mediaList: IMedia[];
  title?: string;
  isEditing: boolean;
  mediaType?: MediaTypeEnum;
  shownQuantity?: number;
  selectedMedia?: IMedia;
  hasBlocks?: boolean;
  step?: IStepWithRelations;
  isOpenEmbedLinkModal?: boolean;
  closeEmbedLinkModal?: () => void;
  setSelectedMedia?: (media: IMedia) => void;
  setShowManageMediaDialog: (show: boolean) => void;
  isEditingMedia: boolean;
  setIsEditingMedia: React.Dispatch<React.SetStateAction<boolean>>;
}

const MediaTab = (props: IMediaTabProps) => {
  const {
    mediaList,
    title = EMediaTitle.MEDIA_GALLERY,
    isEditing,
    mediaType,
    shownQuantity,
    selectedMedia,
    hasBlocks,
    step,
    isOpenEmbedLinkModal = false,
    closeEmbedLinkModal = () => {},
    setSelectedMedia,
    setShowManageMediaDialog,
    isEditingMedia,
    setIsEditingMedia,
  } = props;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [listType, setListType] = useState("ALL");
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
  const specificMedia: IMedia[] =
    mediaType !== undefined ? extractMediaByType(mediaList, mediaType) : [];
  const [showEmbedLinkModal, setShowEmbedLinkModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { organizationStore } = useStores();
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};

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
          {mediaType === undefined ? (
            <VStack
              width="full"
              align="flex-start"
              padding={6}
              gap={2}
              spacing={0}
            >
              {isEditing && !isEditingMedia && checkValidArray(mediaList) && (
                <VStack width="full" align="flex-start">
                  <OutlineButton
                    size="sm"
                    width="full"
                    color={currentTheme?.primaryColor ?? primary500}
                    border={`1px solid ${
                      currentTheme?.primaryColor ?? primary500
                    }`}
                    _hover={{
                      color: "white",
                      background: `${currentTheme?.primaryColor ?? primary500}`,
                      svg: {
                        filter:
                          "invert(34%) sepia(0%) saturate(0%) hue-rotate(12deg) brightness(188%) contrast(111%)",
                      },
                    }}
                    onClick={() => setIsEditingMedia(true)}
                  >
                    <SvgIcon
                      iconName="media-blue"
                      color={currentTheme?.primaryColor ?? primary500}
                      size={isMobile ? 16 : 14}
                      className={
                        isMobile ? styles.mediaIconMobile : styles.mediaIcon
                      }
                    />
                    {isMobile ? "" : "Manage Media"}
                  </OutlineButton>
                </VStack>
              )}
              {!isEditingMedia && checkValidArray(mediaList) && (
                <Menu
                  closeOnSelect={true}
                  autoSelect={false}
                  computePositionOnMount
                  matchWidth
                >
                  {({ isOpen }) => (
                    <>
                      <DropdownButton
                        className={styles.dropdownButton}
                        isOpen={isOpen}
                        width="140px"
                        height={8}
                        item={getMediaTypeDropdownItem()}
                        border={`1px solid ${colors.gray[200]}`}
                        fontSize="sm"
                      />
                      <MenuList zIndex="1001" maxWidth="140px" minWidth="none">
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
              )}
              {isEditing && isEditingMedia && checkValidArray(mediaList) && (
                <SaveButton
                  size="sm"
                  width="full"
                  color="white"
                  background={currentTheme?.primaryColor ?? primary500}
                  _hover={{
                    opacity: "0.8",
                    background: currentTheme?.primaryColor ?? primary500,
                  }}
                  isLoading={isLoading}
                  onClick={() => setIsEditingMedia(false)}
                >
                  <SvgIcon
                    iconName="ic_save"
                    size={14}
                    className={
                      isMobile ? styles.mediaIconMobile : styles.mediaIcon
                    }
                  />
                  {isMobile ? "" : "Save"}
                </SaveButton>
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
                isEditingStep={isEditing}
                isEditingMedia={isEditing && isEditingMedia}
                setShowManageMediaDialog={setShowManageMediaDialog}
                setShowEmbedLinkModal={setShowEmbedLinkModal}
                setIsLoading={setIsLoading}
                step={step}
                hasMedia={checkValidArray(mediaList)}
                hasBlocks={hasBlocks}
              />
            </VStack>
          ) : (
            <div className={styles.filterMenu}>
              <div className={styles.filterLabel}>{title}</div>
            </div>
          )}
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

export default observer(MediaTab);
