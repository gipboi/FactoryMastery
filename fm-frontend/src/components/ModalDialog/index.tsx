import { ReactNode } from "react";
import { MdClose as CloseIcon } from "react-icons/md";
import styles from "./styles.module.scss";
import {
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";

export interface ModalDialogProps extends ModalProps {
  isOpen: boolean;
  title?: string;
  footer?: ReactNode;
  subTitle?: ReactNode;
  position?: "left" | "top" | "right" | "bottom" | "center";
  footerStyle?: React.CSSProperties;
  headless?: boolean;
  headerClassName?: string;
  size?: "xl" | "lg" | "md" | "sm" | "xs";
  bodyClassName?: string;
  backdrop?: "static" | boolean;
  className?: string;
  isLoading?: boolean;
}

const POSITION_CLASSES = {
  left: styles.modalLeft,
  top: styles.modalTop,
  right: styles.modalRight,
  bottom: styles.modalBottom,
  center: "modal-dialog-centered", // this is bootstrap class
};

const ModalDialog = ({
  headerClassName,
  bodyClassName,
  isOpen,
  onClose,
  backdrop,
  position = "center",
  className,
  title,
  children,
  footer,
  footerStyle,
  headless = false,
  subTitle,
  size,
  ...props
}: ModalDialogProps) => {
  const classes = [styles.fmModalDialog];
  if (POSITION_CLASSES[position]) {
    classes.push(POSITION_CLASSES[position]);
  }

  const closeButton = (
    <CloseIcon className={styles.closeIcon} onClick={onClose} />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontWeight="600"
          fontSize="18px"
          lineHeight="28px"
          borderBottom="1px solid #E2E8F0"
          color="gray.800"
        >
          {title}
          {subTitle && <div>{subTitle}</div>}{" "}
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="white"
          top="15px"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "white", borderColor: "unset" }}
        />
        <ModalBody
          paddingTop="24px"
          paddingBottom="27px"
          className={bodyClassName}
        >
          {children}
        </ModalBody>
        {footer ? (
          <>
            <Divider margin={0} />
            <ModalFooter style={footerStyle}>{footer}</ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export default ModalDialog;
