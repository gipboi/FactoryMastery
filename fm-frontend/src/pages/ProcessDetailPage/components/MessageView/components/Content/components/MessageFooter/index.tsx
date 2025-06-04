import { uploadMultipleFiles } from "API/cms";
import { useStores } from "hooks/useStores";
import { useRef, useState } from "react";
import { MdAttachFile as AttachFileIcon } from "react-icons/md";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Col, Row } from "reactstrap";
import { Attachement } from "../../../../types";
import AttachmentTag from "../AttachmentTag";
import styles from "./messageFooter.module.scss";

interface MessageFooterProps {
  stepId: string;
  onSend?: (
    stepId: string,
    comment: string,
    attachements: Attachement[],
    callback?: (isSuccess: boolean) => any
  ) => void;
}

const MessageFooter = ({ onSend = () => {}, stepId }: MessageFooterProps) => {
  const { organizationStore } = useStores();
  const [attachements, setAttachements] = useState<Attachement[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [disableSendOnEnter, setDisableSendOnEnter] = useState<boolean>(false);
  const fileInputRef = useRef<any>(null);

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      setProcessing(true);
      const arrayOfFiles = Array.from(evt.currentTarget.files);
      const uploadings = await uploadMultipleFiles(
        organizationStore.organization?.id ?? "",
        "other",
        arrayOfFiles
      );

      setAttachements([
        ...attachements,
        ...uploadings.map((url: string, idx: number) => ({
          url,
          name: arrayOfFiles[idx].name,
        })),
      ]);
    }
    setProcessing(false);
  }

  function handleSend() {
    setProcessing(true);
    onSend(stepId, comment, attachements, (isSuccess) => {
      if (isSuccess) {
        setComment("");
        setAttachements([]);
      }

      setProcessing(false);
    });
  }

  return (
    <Row className={styles.container}>
      <Col className={styles.layout} md="12">
        <Row>
          <Col className={styles.layout} md="10">
            <div className={styles.comment}>
              <div className={styles.attachment}>
                <AttachFileIcon
                  onClick={() => !processing && fileInputRef.current?.click()}
                />
              </div>
              <div className={styles.textInput}>
                <TextareaAutosize
                  onKeyDown={(evt) => {
                    if (evt.keyCode === 16) setDisableSendOnEnter(true);
                  }}
                  onKeyUp={(evt) => {
                    if (evt.keyCode === 16) setDisableSendOnEnter(false);
                  }}
                  onKeyPress={(evt) => {
                    if (processing) return;
                    if (!disableSendOnEnter && evt.charCode === 13) {
                      evt.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Start typing your comment..."
                  value={comment}
                  onChange={(evt) => setComment(evt.currentTarget.value)}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  style={{ display: "none" }}
                  multiple
                />
              </div>
            </div>
          </Col>
          <Col className={styles.layout} md="2">
            <Button
              className={styles.saveButton}
              color="info"
              onClick={handleSend}
              disabled={processing}
            >
              {processing ? "Processing..." : "Send"}
            </Button>
          </Col>
        </Row>
        <div className={styles.attachmentTag}>
          {attachements.map((attach, idx) => (
            <AttachmentTag
              label={attach.name}
              deleteMode
              onDelete={() => {
                const temp = [...attachements];
                temp.splice(idx, 1);
                setAttachements([...temp]);
              }}
              key={idx}
            />
          ))}
        </div>
      </Col>
    </Row>
  );
};

export default MessageFooter;
