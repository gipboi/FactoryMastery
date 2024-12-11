import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";

interface IDeleteDialogProps {
  title: string;
  isOpen: boolean;
  message: string;
  confirmText?: string;
  toggle: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteDialog = (props: IDeleteDialogProps) => {
  const { isOpen, title, message, confirmText, toggle, onDelete, onCancel } =
    props;
  const cancelRef = React.useRef(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={toggle}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>{message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onCancel}>Cancel</Button>
            <Button colorScheme="red" onClick={onDelete} ml={3}>
              {confirmText ?? "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteDialog;
