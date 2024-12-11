import { Box, BoxProps, Image, Tag } from "@chakra-ui/react";
import cx from "classnames";
import { EMediaThumbnail, MediaType, MediaTypeEnum } from "constants/media";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { observer } from "mobx-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import VideoThumbnail from "react-video-thumbnail";
import MediaThumbnailWithIcon from "./components/MediaThumbnailWithIcon";
import styles from "./mediaThumbnail.module.scss";
import { getThumbnailType } from "./utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface IMediaThumbnailProps extends BoxProps {
  media: IMedia;
  pdfThumbnailClassName?: string;
}

const MediaThumbnail = (props: IMediaThumbnailProps) => {
  const { media, onClick, pdfThumbnailClassName, ...rest } = props;
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>(
    media?.url ?? media?.videoThumbnailUrl ?? media?.video ?? ""
  );

  function handleVideoThumbnail(thumbnail: string): void {
    setVideoThumbnailUrl(thumbnail);
  }

  return (
    <>
      {media?.mediaType === MediaTypeEnum.IMAGE && (
        <Image
          objectFit="contain"
          alt={media.name}
          src={media?.url ?? media?.image ?? media?.originalImage ?? ""}
          onClick={onClick}
          {...rest}
        />
      )}
      {media?.mediaType === MediaTypeEnum.VIDEO && (
        <Box className={styles.videoThumbnail}>
          <VideoThumbnail
            videoUrl={
              media?.url
                ? media.url
                : media?.video ?? ""
            }
            thumbnailHandler={handleVideoThumbnail}
          />
          <Image
            objectFit="contain"
            alt={media?.name}
            src={videoThumbnailUrl ?? media?.url ?? ''}
            onClick={onClick}
            {...rest}
          />
        </Box>
      )}
      {media?.mediaType === MediaTypeEnum.EMBED && (
        <MediaThumbnailWithIcon
          type={EMediaThumbnail.EMBED}
          onClick={onClick}
          {...rest}
        />
      )}
      {[MediaTypeEnum.DOCUMENT, MediaTypeEnum.OTHER]?.includes(
        media?.mediaType ?? MediaTypeEnum.OTHER
      ) && (
        <>
          {getThumbnailType(media) === EMediaThumbnail.PDF ? (
            <Box
              className={cx(styles.pdfThumbnail, pdfThumbnailClassName)}
              onClick={onClick}
              {...rest}
            >
              <Document file={media?.url ?? media?.document?? ''}>
                <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false}/>
              </Document>
            </Box>
          ) : (
            <MediaThumbnailWithIcon
              type={getThumbnailType(media)}
              onClick={onClick}
              {...rest}
            />
          )}
        </>
      )}
      <Tag
        size="sm"
        color="gray.500"
        border="1px solid #E2E8F0"
        position="absolute"
        bottom={2}
        right={2}
        zIndex={2}
      >
        {getThumbnailType(media)}
      </Tag>
    </>
  );
};

export default observer(MediaThumbnail);
