// import { IEcnSuggestionWithRelations } from "interfaces/ecnSuggestion";
import { useEffect, useRef } from "react";
import { Col } from "reactstrap";
import MessageCard from "./components/MessageCard";
import styles from "./messageList.module.scss";

interface MessageListProps {
  stepId: string;
  messages: any;
}

const MessageList = ({ messages, stepId, ...props }: MessageListProps) => {
  const messageEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messageEnd.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className={styles.container} {...props}>
      {Array.isArray(messages) &&
        messages.map((ecn) => (
          <Col className={styles.noSpacing} md="12" key={ecn.id}>
            <MessageCard stepId={stepId} ecnSuggestion={ecn} />
          </Col>
        ))}
      <div ref={messageEnd} />
    </div>
  );
};

export default MessageList;
