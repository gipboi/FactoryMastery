import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useState } from "react";
import {
  CardBody,
  CardProps,
  CardText,
  CardTitle,
  DropdownItem,
} from "reactstrap";
// import { deleteCollectionMainMedia } from 'API/collection'
import Card from "components/Card";
import DropdownMenu from "components/DropdownMenu";
import InlineTextField from "components/InlineTextField";
import MediaThumbnail from "components/MediaThumbnail";
import { MediaTypeEnum } from "constants/media";
import { IMedia } from "interfaces/media";
import styles from "./mediaCard.module.scss";
import { deleteMediaById } from "API/media";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";

interface MediaItemProps extends CardProps {
  media: IMedia & { collectionId?: number };
  onChangeCaption?: Function;
  noEditCaption?: boolean;
}
const MediaItem = ({
  media,
  noEditCaption = false,
  className,
  onChangeCaption = () => {},
  ...props
}: MediaItemProps) => {
  const { processStore } = useStores(); //INFO: delete colectionStore
  const [editing, setEditing] = useState<boolean>(false);

  async function handleDeleteMedia() {
    if (media.collectionId) {
      // await deleteCollectionMainMedia(media.collectionId);
      // collectionStore.getCollectDetail(media.collectionId);
      return;
    }
    await deleteMediaById(media.id);
    getRenderProcess(processStore.process.id, processStore);
  }

  return (
    <Card className={cx(styles.mediaCard, className)} {...props}>
      <MediaThumbnail
        media={media}
        marginLeft="10px"
        pdfThumbnailClassName={styles.pdfThumbnail}
      />
      <CardBody className={styles.cardBody}>
        <CardTitle className={styles.mediaCaption}>
          <InlineTextField
            style={{ width: "85%" }}
            value={media.name}
            onApplyChange={onChangeCaption}
            noedit
            editFirst={editing}
            onStopEdit={() => setEditing(false)}
          />
        </CardTitle>
        <CardText className={styles.mediaName}>
          {media?.mediaType === MediaTypeEnum.IMAGE &&
            (media?.originalFile || media?.image || media?.originalImage)}
          {media?.mediaType === MediaTypeEnum.DOCUMENT &&
            (media.originalFile || media.document)}
          {media?.mediaType === MediaTypeEnum.VIDEO &&
            (media.originalFile || media.video || media.url)}
          {media?.mediaType === MediaTypeEnum.EMBED && media.url}
        </CardText>
      </CardBody>
      <DropdownMenu
        color="light"
        className={styles.actionMenu}
        placeholder="..."
      >
        {!noEditCaption && (
          <DropdownItem onClick={() => setEditing(true)}>Caption</DropdownItem>
        )}
        <DropdownItem style={{ color: "red" }} onClick={handleDeleteMedia}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Card>
  );
};

export default observer(MediaItem);
