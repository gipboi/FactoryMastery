import { Box, CloseButton, HStack, VStack } from "@chakra-ui/react";
import imgPlaceholder from "assets/images/missing_image.png";
import cx from "classnames";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import Carousel from "nuka-carousel";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";
// import { deleteCollectionMainMedia } from 'API/collection'
// import { deleteMediaById } from 'API/media'
import Button from "components/Button";
import Icon from "components/Icon";
import Iframe from "components/Iframe";
import Image from "components/Image";
import LightBox from "components/LightBox";
import { convertToEmbedLink } from "components/MediaTab/utils";
import MediaThumbnail from "components/MediaThumbnail";
import SvgIcon from "components/SvgIcon";
import { MediaType, MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";
import { getValidArray } from "utils/common";
import DropZone from "../DropZone";
import styles from "./customMedia.module.scss";

interface IMediaCardProps {
  step?: IStepWithRelations;
  mediaList: (IMedia & { collectionId?: string })[];
  shownQuantity?: number;
  selectedMedia?: IMedia;
  isEditingMedia: boolean;
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
    isEditingMedia,
    setShowManageMediaDialog,
    setShowEmbedLinkModal,
    setIsLoading,
  } = props;
  const { organizationStore, processStore } = useStores();
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== imgPlaceholder) {
      evt.currentTarget.src = imgPlaceholder;
    }
  }
  function handleOpenLightBox(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    event.stopPropagation();
    setShowLightBox(true);
  }
  async function handleDeleteMedia(media: IMedia & { collectionId?: number }) {
    setIsLoading && setIsLoading(true);
    if (media.collectionId) {
      // await deleteCollectionMainMedia(media.collectionId);
      // collectionStore.getCollectDetail(media.collectionId);
      return;
    }
    // await deleteMediaById(media.id);
    await getRenderProcess(processStore.process.id ?? "", processStore);
    setIsLoading && setIsLoading(false);
    toast.success("Delete media successfully");
  }

  useEffect(() => {
    setSelectedMedia &&
      setSelectedMedia(mediaList?.[0] ? mediaList[0] : ({} as IMedia));
  }, []);

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
      {isEditingMedia ? (
        <VStack width="full">
          <DropZone
            step={step}
            organizationId={organizationStore.organization?.id ?? ""}
            fetchData={() =>
              getRenderProcess(processStore.process.id ?? "", processStore)
            }
          />
          <HStack width="full" justifyContent="space-between">
            <Button
              outline
              color="info"
              colorScheme="info"
              className={styles.mediaButton}
              onClick={() => setShowManageMediaDialog(true)}
            >
              <SvgIcon iconName="file-upload" size={14} />
              Upload files
            </Button>
            <Button
              outline
              color="info"
              colorScheme="info"
              className={styles.mediaButton}
              onClick={() =>
                setShowEmbedLinkModal && setShowEmbedLinkModal(true)
              }
            >
              <SvgIcon iconName="insert-link" size={14} />
              Embed link
            </Button>
          </HStack>
        </VStack>
      ) : (
        <Box
          width="full"
          onClick={(event) => handleOpenLightBox(event)}
          cursor="pointer"
        >
          {selectedMedia?.mediaType === MediaTypeEnum.IMAGE && (
            <Col
              md="12"
              className={cx(styles.mainMediaWithImage, {
                [styles.mainMediaMobile]: isMobile,
              })}
            >
              <Image
                alt={selectedMedia?.name}
                src={
                  (organizationStore.organization?.id ?? "",
                  selectedMedia?.image ?? selectedMedia?.originalImage)
                }
              />
            </Col>
          )}
          {selectedMedia?.mediaType === MediaTypeEnum.VIDEO && (
            <Col
              md="12"
              className={cx(styles.mainMediaWithVideo, {
                [styles.mainMediaMobile]: isMobile,
              })}
            >
              <ReactPlayer
                url={
                  (organizationStore.organization?.id ?? "",
                  selectedMedia?.video || selectedMedia?.url || "")
                }
                controls
              />
            </Col>
          )}
          {selectedMedia?.mediaType === MediaTypeEnum.DOCUMENT && (
            <Col
              md="12"
              className={cx(styles.mainMediaWithFile, {
                [styles.mainMediaMobile]: isMobile,
              })}
            >
              <a
                target="_blank"
                href={
                  (organizationStore.organization?.id ?? "",
                  selectedMedia?.document)
                }
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <Icon icon="download" group="fontawesome" />
              </a>
            </Col>
          )}
          {selectedMedia?.mediaType === MediaTypeEnum.EMBED && (
            <Iframe
              src={convertToEmbedLink(selectedMedia?.url ?? "")}
              onClick={() => setShowLightBox(true)}
            />
          )}
        </Box>
      )}
      {shownQuantity === undefined || shownQuantity > 1 ? (
        <Col md="12" className={styles.listMedia}>
          <div className={styles.listWrapper}>
            <Carousel
              className={styles.carousel}
              dragging={true}
              wrapAround={false}
              cellSpacing={8}
              slidesToShow={mediaList?.length > 3 ? 3 : mediaList?.length}
              renderCenterLeftControls={(controlProps) => {
                return (
                  <SvgIcon
                    cursor="pointer"
                    iconName="circle_left_arrow"
                    size={32}
                    onClick={() => {
                      controlProps.previousSlide();
                    }}
                    {...controlProps}
                  />
                );
              }}
              renderCenterRightControls={(controlProps) => {
                return (
                  <SvgIcon
                    cursor="pointer"
                    iconName="circle_right_arrow"
                    size={32}
                    onClick={() => {
                      controlProps.nextSlide();
                    }}
                    {...controlProps}
                  />
                );
              }}
              renderBottomCenterControls={() => null}
            >
              {Array.isArray(mediaList) &&
                mediaList.map((media: IMedia, index: number) => (
                  <div>
                    <div
                      key={index}
                      className={cx(styles.elementPlaceholder, {
                        [currentTheme?.primaryColor
                          ? styles.active_with_current_theme_color
                          : styles.active]: selectedMedia?.id === media.id,
                        [styles.fileImage]: media?.mediaType === MediaTypeEnum.DOCUMENT,
                      })}
                      onClick={() =>
                        setSelectedMedia && setSelectedMedia(media)
                      }
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
                      <MediaThumbnail media={media} width="112px" />
                    </div>
                  </div>
                ))}
            </Carousel>
          </div>
        </Col>
      ) : (
        <></>
      )}
      <HStack spacing={0} width="full">
        <LightBox
          mediaList={mediaList}
          showModal={showLightBox}
          imageIndex={getValidArray(mediaList).findIndex(
            (media) => media.id === selectedMedia?.id
          )}
          onCloseModal={() => setShowLightBox(false)}
        />
      </HStack>
    </Row>
  );
};

export default observer(MediaCard);
