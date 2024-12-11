import cx from "classnames";
import Image from "components/Image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useStores } from "hooks/useStores";
import mime from "mime";
import { Col, Row } from "reactstrap";
// import { IEcnSuggestionWithRelations } from 'interfaces/ecnSuggestion'
// import { IEcnSuggestionAttachment } from 'interfaces/ecnSuggestionAttachement'
import AttachmentTag from "../../../AttachmentTag";
import styles from "./messageCard.module.scss";

dayjs.extend(relativeTime);

interface MessageProps {
  stepId?: string;
  ecnSuggestion: any;
}

const MessageCard = ({ ecnSuggestion }: MessageProps) => {
  const { organizationStore } = useStores();
  let attachementSegments = {
    images: [],
    others: [],
  };

  if (Array.isArray(ecnSuggestion.ecnSuggestionAttachments)) {
    attachementSegments = ecnSuggestion.ecnSuggestionAttachments.reduce(
      (segments: any, attach: any) => {
        const mimeName: string = mime.getType(attach.attachment ?? "") ?? "";
        if (mimeName.startsWith("image")) {
          return {
            ...segments,
            images: [...segments.images, attach],
          };
        }
        return {
          ...segments,
          others: [...segments.others, attach],
        };
      },
      {
        images: [],
        others: [],
      }
    );
  }

  return (
    <Row className={styles.container}>
      <Col
        className={cx(styles.noSpacing, styles.avatar)}
        xl="1"
        lg="1"
        md="2"
        sm="2"
        xs="2"
      >
        <Image src={ecnSuggestion?.user?.image ?? ""} alt="usericon" />
      </Col>
      <Col
        className={cx(styles.noSpacing, styles.message)}
        xl="11"
        lg="11"
        md="10"
        sm="10"
        xs="10"
      >
        <div className={styles.author}>
          <div className={styles.name}>
            {ecnSuggestion.user?.username ?? ""}
          </div>
          <div className={styles.createdAt}>
            {dayjs(ecnSuggestion?.createdAt).fromNow()}
          </div>
        </div>
        <div className={styles.content}>{ecnSuggestion.comment}</div>
        <div className={styles.attachment}>
          <div className={styles.imageAttach}>
            {attachementSegments.images.map((attach: any) => {
              const url = organizationStore.organization?.id ?? "";
              return (
                <a href={url} target="_blank" rel="noreferrer">
                  <Image
                    width={300}
                    height={200}
                    src={url}
                    alt={attach.attachment ?? ""}
                  />
                </a>
              );
            })}
          </div>
          <div className={styles.otherAttach}>
            {attachementSegments.others.map((attach: any) => {
              const url = organizationStore.organization?.id ?? "";
              return (
                <AttachmentTag
                  key={attach.id}
                  label={attach.originalFile || attach.attachment || ""}
                  downloadUrl={url}
                />
              );
            })}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default MessageCard;
