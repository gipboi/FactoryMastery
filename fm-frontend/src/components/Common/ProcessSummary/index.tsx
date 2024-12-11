import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IPagination } from "components/Pagination";
import { StepPosition } from "constants/processStep";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { IStep } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import orderBy from "lodash/orderBy";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder'
import ItemProcess from "components/ItemProcess";
import { AuthRoleNameEnum } from "constants/user";
import routes from "routes";
import { getValidArray } from "utils/common";
import ProcessPagination from "./components/ProcessPagination";
import Avatar from "components/Avatar";
import { primary500 } from "themes/globalStyles";

interface ISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProcess?: () => void;
}

const ProcessSummary = (props: ISummaryModalProps) => {
  const { isOpen, onClose, onEditProcess } = props;
  const { processStore, authStore, organizationStore } = useStores(); //*INFO: Delete iconBuilderStore
  const { selectedProcessId, processDetail } = processStore;
  const navigate = useNavigate();
  const { groups = [], steps } = processDetail;
  // const activeCollections = getValidArray(processDetail?.collections).filter(
  //   (collection) => !collection?.archivedAt
  // );
  const totalStepsProcess: number = getValidArray(steps)?.length;
  const [displayProcessSteps, setDisplayProcessSteps] = useState<IStep[]>([]);
  const [page, setPage] = useState<number>(1);
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER; // Use name instead of id
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  const pagination: IPagination = {
    gotoPage: setPage,
    includePagination: totalStepsProcess > 0,
    limit: StepPosition.ProcessStepLimit,
    pageIndex: page ?? 0,
    totalResults: totalStepsProcess,
    tableLength: totalStepsProcess,
  };

  useEffect(() => {
    const selectPage: number = (page - 1) * StepPosition.ProcessStepLimit;
    if (isOpen && processDetail) {
      setDisplayProcessSteps(
        orderBy(getValidArray(steps), "position").slice(
          selectPage,
          selectPage + StepPosition.ProcessStepLimit
        )
      );
    } else {
      setPage(1);
      processStore.resetProcessSteps();
    }
  }, [processDetail, page, isOpen]);

  useEffect(() => {
    if (isOpen && selectedProcessId) {
      processStore.getProcessDetailById(selectedProcessId);
    }
  }, [selectedProcessId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize="18px"
          lineHeight={7}
          color="gray.800"
          fontWeight={500}
          borderBottom="1px solid #E2E8F0"
        >
          Process Summary
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ background: "#fff", borderColor: "unset" }}
          _active={{ background: "#fff", borderColor: "unset" }}
        />
        <ModalBody padding={6}>
          <VStack spacing={6} alignItems="flex-start">
            <VStack spacing={2} alignItems="flex-start">
              {/* {getValidArray(activeCollections).length > 0 ? (
                <HStack>
                  <IconButton
                    variant="outline"
                    colorScheme="teal"
                    aria-label="Send email"
                    size="24px"
                    borderRadius="6px"
                    border="none"
                    icon={<SvgIcon iconName="collection-name-icon" />}
                  />
                  <Text
                    color="gray.500"
                    fontSize="16px"
                    fontWeight="500"
                    whiteSpace="normal"
                  >
                    {getValidArray(activeCollections)?.length === 1
                      ? get(activeCollections, "[0].name", "")
                      : "Multiple Collections"}
                  </Text>
                </HStack>
              ) : null} */}

              <HStack
              // paddingLeft={
              //   getValidArray(processDetail?.collections)?.length > 0
              //     ? "8"
              //     : "0"
              // }
              >
                {/* <IconBuilder
                  icon={iconBuilderStore.getIconById(
                    processDetail?.documentType?.iconId ??
                      EIconDefaultId.DOCUMENT_TYPE
                  )}
                  size={24}
                  isActive
                /> */}
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="700"
                  whiteSpace="normal"
                  cursor="pointer"
                  _hover={{ color: currentTheme?.primaryColor ?? primary500 }}
                  onClick={() => {
                    navigate(
                      routes.processes.processId.value(
                        String(processDetail?.id ?? "")
                      )
                    );
                  }}
                >
                  {processDetail?.name ?? ""}
                </Text>
              </HStack>
            </VStack>
            <VStack alignItems="flex-start" width="full">
              <ItemProcess label="Version Value">
                {processDetail?.version ? (
                  <Tag
                    variant="solid"
                    background="gray.200"
                    w="48px"
                    h="24px"
                    borderRadius="6px"
                    fontSize="14px"
                    color="gray.700"
                  >
                    {processDetail.version}
                  </Tag>
                ) : null}
              </ItemProcess>
              <ItemProcess label="Last Updated">
                <Text color="gray.700" fontSize="16px" fontWeight="400">
                  {dayjs(processDetail?.updatedAt).format("MMMM DD, YYYY")}
                </Text>
              </ItemProcess>
              <ItemProcess label="Publish Date">
                <Text color="gray.700" fontSize="16px" fontWeight="400">
                  {dayjs(
                    processDetail?.publishedDate ?? processDetail?.createdAt
                  ).format("MMMM DD, YYYY")}
                </Text>
              </ItemProcess>
              <ItemProcess label="Release Notes">
                <Text color="gray.700" fontSize="16px" fontWeight="400">
                  {processDetail?.releaseNote ?? ""}
                </Text>
              </ItemProcess>
              {!isBasicUser && (
                <ItemProcess label="Editor Notes">
                  <Text color="gray.700" fontSize="16px" fontWeight="400">
                    {processDetail?.editorNote ?? ""}
                  </Text>
                </ItemProcess>
              )}
              <ItemProcess label="Created By">
                <HStack align="flex-start">
                  <Avatar
                    name={processDetail?.creatorName ?? ""}
                    src={processDetail?.creatorImage ?? ""}
                  />
                  <Text color="gray.700" fontSize="16px" fontWeight="400">
                    {processDetail?.creatorName ?? ""}
                  </Text>
                </HStack>
              </ItemProcess>
              <ItemProcess label="Groups">
                <HStack spacing={0} gap={2} flexWrap="wrap">
                  {getValidArray(groups).map((group) => (
                    <Tag
                      key={group.id}
                      variant="solid"
                      background="gray.200"
                      borderRadius="6px"
                      fontSize="14px"
                      color="gray.700"
                      h="24px"
                      whiteSpace="nowrap"
                    >
                      {group.name}
                    </Tag>
                  ))}
                </HStack>
              </ItemProcess>
              {/* {getValidArray(activeCollections).length > 0 && (
                <ItemProcess label="Collections">
                  <HStack spacing={0} gap={2} flexWrap="wrap">
                    {getValidArray(activeCollections).map((collection) => (
                      <Tag
                        key={collection?.id}
                        variant="solid"
                        background="gray.200"
                        borderRadius="6px"
                        fontSize="14px"
                        color="gray.700"
                        h="24px"
                        whiteSpace="nowrap"
                      >
                        {collection?.name}
                      </Tag>
                    ))}
                  </HStack>
                </ItemProcess>
              )} */}
              <ItemProcess label="Document Type">
                <Text color="gray.700" fontSize="16px" fontWeight="400">
                  {processDetail?.documentType?.name ?? ""}
                </Text>
              </ItemProcess>
              <ItemProcess label="Tags">
                <HStack spacing={0} gap={2} flexWrap="wrap">
                  {processDetail?.tags?.map((tag, index) => (
                    <Tag
                      key={`${processDetail?.id ?? 0} ${tag.id} ${index}`}
                      variant="solid"
                      background="gray.200"
                      h="24px"
                      borderRadius="6px"
                      fontSize="14px"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </HStack>
              </ItemProcess>
              <HStack width="full" justifyContent="space-between">
                <ItemProcess label="Steps"></ItemProcess>
                {totalStepsProcess > StepPosition.ProcessStepLimit && (
                  <ProcessPagination pagination={pagination} />
                )}
              </HStack>
            </VStack>
          </VStack>
          <VStack alignItems="start-flex">
            {getValidArray(displayProcessSteps).map(
              (step: IStep, index: number) => (
                <HStack
                  spacing={3}
                  key={`${processDetail?.id ?? 0} ${step?.id ?? 0} ${index}`}
                >
                  {/* <IconBuilder
                    icon={iconBuilderStore.getIconById(
                      step?.iconId ?? EIconDefaultId.STEP
                    )}
                    size={24}
                    isActive
                  /> */}
                  <Text
                    color="#313A46"
                    fontSize="14px"
                    fontWeight="500"
                    whiteSpace="normal"
                  >
                    {(page - 1) * StepPosition.ProcessStepLimit + index + 1}.{" "}
                    {step?.name ?? ""}
                  </Text>
                </HStack>
              )
            )}
          </VStack>
        </ModalBody>
        {onEditProcess && (
          <ModalFooter justifyContent="center" paddingBottom="24px">
            <Button
              variant="outline"
              borderRadius="6px"
              color="white"
              fontWeight={500}
              fontSize="16px"
              lineHeight="24px"
              background={currentTheme?.primaryColor ?? "primary.500"}
              _hover={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _active={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _focus={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              onClick={onEditProcess}
            >
              Edit process summary
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(ProcessSummary);
