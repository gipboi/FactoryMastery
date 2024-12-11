import cx from "classnames";
import Button from "components/Button";
import ModalDialog, { ModalDialogProps } from "components/ModalDialog";
import { MediaType, MediaTypeEnum } from "constants/media";
import { IMedia } from "interfaces/media";
import { ChangeEvent, useRef, useState } from "react";
import { Progress } from "reactstrap";
import MediaCard from "./components/MediaItem";
import styles from "./mediaManager.module.scss";

interface MediaManagerProps
  extends Omit<ModalDialogProps, "title" | "children"> {
  mediaList: (IMedia & { collectionId?: number })[]; // INFO: currently using to display main image from collection as well
  onFileUpload?: (
    fileUpload: File,
    setUploadProgress: (percent: number) => any
  ) => any;
  onUpdateCaption?: (mediaId: string, caption: string) => any;
  noEditCaption?: boolean;
  handleShowAutosave?: () => void;
  accept?: string;
}

export enum MediaFileType {
  IMAGE = "image",
  VIDEO = "video",
  FILE = "other",
}

export const MEDIATYPES: { [key: string]: any } = {
  image: {
    mediaType: MediaTypeEnum.IMAGE,
    column: "image",
  },
  video: {
    mediaType: MediaTypeEnum.VIDEO,
    column: "video",
  },
  other: {
    mediaType: MediaTypeEnum.DOCUMENT,
    column: "document",
  },
};

const MediaManager = ({
  mediaList,
  onFileUpload = () => {},
  onUpdateCaption = () => {},
  handleShowAutosave = () => {},
  noEditCaption = false,
  className,
  accept = "",
  ...props
}: MediaManagerProps) => {
  const fileInputRef = useRef<any>(null);
  const [uploadProgress, setUploadProgress] = useState(1);
  const [uploadingFileName, setUploadingFileName] = useState("");

  async function handleUpload(evt: ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const fileToUpload = evt.currentTarget.files[0];
      if (fileToUpload) {
        setUploadingFileName(fileToUpload.name);

        try {
          await Promise.resolve(onFileUpload(fileToUpload, setUploadProgress));
          await handleShowAutosave();
        } finally {
          setUploadingFileName("");
        }
      }
    }
  }

  return (
    <ModalDialog
      title="Manage Media"
      className={cx(styles.dialog, className)}
      {...props}
    >
      <div className={styles.uploadPanel}>
        {uploadingFileName ? (
          <>
            <span>Uploading: {uploadingFileName}</span>
            <Progress
              value={uploadProgress}
              color="info"
              className={styles.progress}
            >
              {uploadProgress}%
            </Progress>
          </>
        ) : (
          <>
            <input
              type="file"
              accept={accept}
              ref={fileInputRef}
              onChange={handleUpload}
              style={{ display: "none" }}
            />
            <Button
              outline
              color="white"
              onClick={() => fileInputRef.current?.click()}
            >
              + Upload Media
            </Button>
          </>
        )}
      </div>
      <div>
        {mediaList.map((media) => {
          const mediaId: string = media?._id ?? media?.id ?? "";
          return (
            <MediaCard
              media={media}
              key={mediaId}
              noEditCaption={noEditCaption}
              onChangeCaption={(caption: string) =>
                onUpdateCaption(mediaId, caption)
              }
            />
          )
        })}
      </div>
    </ModalDialog>
  );
};

export default MediaManager;
