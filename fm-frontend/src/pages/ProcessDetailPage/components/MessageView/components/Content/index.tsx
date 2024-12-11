import cx from "classnames";
import { Col, Row } from "reactstrap";
// import { IEcnSuggestionWithRelations } from 'interfaces/ecnSuggestion'
import { Attachement } from "../../types";
import MessageFooter from "./components/MessageFooter";
import MessageList from "./components/MessageList";
import styles from "./content.module.scss";

interface ContentProps {
  stepId: string;
  messages?: any;
  onSendMessage?: (
    stepId: string,
    comment: string,
    attachements: Attachement[],
    callback?: (isSuccess: boolean) => any
  ) => void;
}

const Content = ({
  messages,
  stepId,
  onSendMessage,
  ...props
}: ContentProps) => {
  return (
    <Row className={styles.container} {...props}>
      <Col
        className={cx(styles.resetSpacing, styles.collection, styles.wrapper)}
        md="12"
      >
        <MessageList stepId={stepId} messages={messages} />
        {onSendMessage && (
          <MessageFooter stepId={stepId} onSend={onSendMessage} />
        )}
      </Col>
    </Row>
  );
};

export default Content;
