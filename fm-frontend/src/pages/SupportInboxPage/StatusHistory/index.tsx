/* eslint-disable max-lines */
import {
  Avatar,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import Spinner from "components/Spinner";
import { S3FileTypeEnum } from "constants/aws";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { getValidArray } from "utils/common";
import { getFullName } from "utils/user";
import { getStatusText } from "../constants";
dayjs.extend(relativeTime);

interface IStatusHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatusHistory = (props: IStatusHistoryProps) => {
  const { isOpen, onClose } = props;
  const { authStore, messageStore } = useStores();
  const { currentSupportThreadId, statusHistory } = messageStore;
  const { userDetail } = authStore;
  const organizationId: string = userDetail?.organizationId ?? "";
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function fetchData(): Promise<void> {
    setIsLoading(true);
    await messageStore.getStatusHistory(currentSupportThreadId);
    setIsLoading(false);
  }

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, organizationId]);

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius={8}>
        <ModalHeader
          fontSize="lg"
          fontWeight={500}
          lineHeight={7}
          color="gray.800"
          borderBottom="1px solid #E2E8F0"
        >
          Thread’s status history
        </ModalHeader>
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody padding={6}>
          {isLoading ? (
            <Spinner />
          ) : (
            <VStack width="full" align="flex-start" spacing={1}>
              {getValidArray(statusHistory).map((history) => {
                const fullName = getFullName(
                  history?.user?.firstName,
                  history?.user?.lastName
                );
                const avatar = history?.user?.image
                  ? (S3FileTypeEnum.IMAGE, organizationId, history?.user?.image)
                  : // Ask Tien
                    "";
                return (
                  <HStack
                    width="full"
                    height="58px"
                    justify="space-between"
                    paddingY={2}
                  >
                    <HStack width="full" spacing={4}>
                      <Avatar size="sm" name={fullName} src={avatar} />
                      <Text
                        color="gray.700"
                        fontSize="14px"
                        fontWeight={400}
                        lineHeight="22px"
                      >
                        <Text as="span" fontWeight={600}>
                          {fullName}
                        </Text>
                        {" change the status to "}
                        <Text as="span" fontWeight={600}>
                          {`"${getStatusText(history?.status)}"`}
                        </Text>
                      </Text>
                    </HStack>
                    <Text
                      minWidth="max-content"
                      color="gray.400"
                      fontSize="14px"
                      fontWeight={500}
                      lineHeight="22px"
                    >
                      {dayjs(history?.createdAt).fromNow()}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(StatusHistory);
