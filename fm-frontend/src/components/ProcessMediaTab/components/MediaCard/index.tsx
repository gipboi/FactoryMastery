import { Box, CloseButton, HStack, VStack } from "@chakra-ui/react";
import cx from "classnames";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";
import { primary } from "themes/globalStyles";
import LightBox from "components/LightBox";
import MediaThumbnail from "components/MediaThumbnail";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { getValidArray } from "utils/common";
import styles from "./customMedia.module.scss";
import { UploadButton } from "./mediaCard.styles";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";
import { deleteMediaById } from "API/media";

interface IMediaCardProps {
  step?: IStepWithRelations;
  mediaList: (IMedia & { collectionId?: number })[];
  shownQuantity?: number;
  selectedMedia?: IMedia;
  isEditingStep: boolean;
  isEditingMedia: boolean;
  hasMedia?: boolean;
  hasBlocks?: boolean;
  setSelectedMedia?: (media: IMedia) => void;
  setShowManageMediaDialog: (show: boolean) => void;
  setShowEmbedLinkModal?: (show: boolean) => void;
  setIsLoading?: (isLoading: boolean) => void;
}

const MediaCard = (props: IMediaCardProps) => {
  const {
    step,
    mediaList,
    shownQuantity,
    selectedMedia = mediaList?.[0],
    setSelectedMedia,
    isEditingStep,
    isEditingMedia,
    hasMedia,
    hasBlocks,
    setShowManageMediaDialog,
    setShowEmbedLinkModal,
    setIsLoading,
  } = props;
  const { organizationStore, processStore } = useStores();
  const [currentMediaList, setCurrentMediaList] = useState<IMedia[]>(mediaList);
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  function handleOpenLightBox(media: IMedia): void {
    setSelectedMedia && setSelectedMedia(media);
    if (isEditingMedia || (hasMedia && !hasBlocks)) {
      return;
    }
    setShowLightBox(true);  
  }
  async function handleDeleteMedia(media: IMedia & { collectionId?: number }) {
    setIsLoading && setIsLoading(true);
    // if (media.collectionId) {
    //   await deleteCollectionMainMedia(media.collectionId);
    //   collectionStore.getCollectDetail(media.collectionId);
    //   return;
    // }
    await deleteMediaById(media?._id ?? media?.id);
    await getRenderProcess(processStore.process.id, processStore);
    setIsLoading && setIsLoading(false);
    setSelectedMedia && setSelectedMedia(mediaList[0]);
    toast.success("Delete media successfully");
  }

  useEffect(() => {
    setSelectedMedia &&
      setSelectedMedia(mediaList?.[0] ? mediaList[0] : ({} as IMedia));
  }, []);

  useEffect(() => {
    setCurrentMediaList(mediaList);
  }, [mediaList]);

  useEffect(() => {
    if (isEditingStep) {
      setCurrentMediaList(mediaList);
    } else {
      let allMediumIds: string[] = [];
      getValidArray(step?.blocks).forEach((block) => {
        const blockMediaIds = getValidArray(block?.blockMedias).map(
          (blockMedia) => blockMedia?.mediaId
        );
        allMediumIds = [...allMediumIds, ...blockMediaIds];
      });
      setCurrentMediaList(
        mediaList.filter((media) => !allMediumIds.includes(media?.id))
      );
    }
  }, [isEditingStep]);

  return (
    <Row
      className={cx(styles.container, {
        [styles.containerEmpty]:
          getValidArray(mediaList).length === 0 && !isEditingMedia,
      })}
    >
      {shownQuantity === 1 && (
        <Col md="12" className={styles.descriptionMedia}>
          {selectedMedia?.image ||
            selectedMedia?.originalImage ||
            selectedMedia?.name ||
            selectedMedia?.image ||
            "No name"}
        </Col>
      )}
      {(isEditingMedia || !hasMedia) && (
        <VStack width="full" gap={4} spacing={0}>
          <VStack width="full" order={hasMedia ? 0 : 1}>
            <UploadButton
              size="sm"
              onClick={() => setShowManageMediaDialog(true)}
            >
              <SvgIcon iconName="file-upload" size={14} color="gray.600" />
              Upload files
            </UploadButton>
            <UploadButton
              size="sm"
              onClick={() =>
                setShowEmbedLinkModal && setShowEmbedLinkModal(true)
              }
            >
              <SvgIcon iconName="insert-link" size={14} color="gray.600" />
              Embed link
            </UploadButton>
          </VStack>
          {/* <DropZone
            step={step}
            organizationId={organizationStore.organization?.id ?? ""}
            fetchData={() =>
              getRenderProcess(processStore.process.id, processStore)
            }
          /> */}
        </VStack>
      )}
      <VStack width="full" marginTop={isEditingMedia ? 4 : 0}>
        {(shownQuantity === undefined || shownQuantity > 1) &&
          getValidArray(currentMediaList).map(
            (media: IMedia, index: number) => (
              <Box
                key={index}
                width="full"
                height={{ base: "212px", md: "140px" }}
                borderRadius={4}
                position="relative"
                css={{
                  img: {
                    width: "100%",
                    height: isMobile ? "212px" : "140px",
                    borderRadius: "4px",
                    objectFit: "contain",
                    boxSizing: "border-box",
                    opacity: !hasBlocks
                      ? media?.id === selectedMedia?.id
                        ? "1"
                        : "0.5"
                      : undefined,
                    border:
                      !hasBlocks && media?.id === selectedMedia?.id
                        ? `2px solid ${currentTheme?.primaryColor ?? primary}`
                        : "1px solid #CBD5E0",
                  },
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenLightBox(media);
                }}
              >
                {isEditingMedia && (
                  <CloseButton
                    className={styles.thumbnailCloseButton}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(media);
                    }}
                  />
                )}
                <MediaThumbnail
                  media={media}
                  width="full"
                  height={{ base: "212px", md: "140px" }}
                  opacity={
                    !hasBlocks
                      ? media?.id === selectedMedia?.id
                        ? "1"
                        : "0.5"
                      : undefined
                  }
                  borderRadius={4}
                  border={
                    !hasBlocks && media?.id === selectedMedia?.id
                      ? `2px solid ${currentTheme?.primaryColor ?? primary}`
                      : "1px solid #CBD5E0"
                  }
                />
              </Box>
            )
          )}
      </VStack>
      <HStack spacing={0}>
        <LightBox
          mediaList={mediaList}
          showModal={showLightBox}
          imageIndex={getValidArray(mediaList).findIndex(
            (media) => (media._id || media.id) === (selectedMedia?._id || selectedMedia?.id)
          )}
          onCloseModal={() => setShowLightBox(false)}
        />
      </HStack>
    </Row>
  );
};

export default observer(MediaCard);
