import {
  Box,
  GridItem,
  HStack,
  IconButton,
  Link,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { ReactComponent as ProcessIcon } from "assets/icons/process.svg";
import ProcessSummary from "components/Common/ProcessSummary";
import { processIcon } from "components/Icon";
import SvgIcon from "components/SvgIcon";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { getProcessPipeline } from "pages/ProcessPage/aggregate";
import { queryParser } from "pages/ProcessPage/aggregate/queryParser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
import EmptyResult from "../EmptyResult";
import ModalDraftView from "../ModalDraftView";
import styles from "./styles.module.scss";

const DraftView = () => {
  const {
    isOpen: isOpenDashboard,
    onOpen: onOpenDashboard,
    onClose: onCloseDashboard,
  } = useDisclosure();
  const {
    isOpen: isOpenProcessDetail,
    onOpen: onOpenProcessDetail,
    onClose: onCloseProcessDetail,
  } = useDisclosure();
  const {
    processStore,
    authStore,
    userStore,
    organizationStore,
    groupStore,
    // iconBuilderStore,
  } = useStores();
  const { userDetail } = authStore;
  const { currentUser } = userStore;
  const isBasicUser =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { processes } = processStore;
  const navigate = useNavigate();

  const mostRecentProcesses: IProcessWithRelations[] =
    getValidArray<IProcessWithRelations>(processes).slice(0, 8);

  function handleOpenProcessDetail(processId: string): void {
    processStore.setSelectedProcessId(processId);
    onOpenProcessDetail();
  }

  async function fetchDrafts(organizationId?: string) {
    try {
      if (organizationId && userDetail?.id) {
        const dataPipeline = getProcessPipeline(
          organizationId,
          100,
          0,
          [],
          [userDetail.id],
          [],
          [],
          [],
          "updatedAt",
          false,
          false,
          userDetail.id,
          userDetail.authRole,
          false,
          "",
          userDetail.authRole === AuthRoleNameEnum.BASIC_USER
        );
        await processStore.getProcessByAggregate(dataPipeline, queryParser);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isEmpty(userDetail)) {
      fetchDrafts(organization?.id);
      groupStore.getGroups({ where: { organizationId: organization?.id } });
    }
  }, [organization, userDetail?.id]);

  if (!currentUser?.isEditor && isBasicUser) return null;

  return (
    <VStack
      backgroundColor=" #FFFFFF"
      margin-top="16px"
      borderRadius="8px"
      gap={4}
      width="full"
      alignSelf="flex-start"
    >
      <VStack
        padding={4}
        spacing={4}
        alignItems="flex-start"
        alignSelf="flex-start"
        width="full"
      >
        <HStack
          spacing={4}
          minWidth="max-content"
          justifyContent="space-between"
          width="100%"
        >
          <HStack spacing={2} alignItems="center" alignSelf="flex-start">
            <ProcessIcon width={24} height={24} />
            <Text
              fontSize="18px"
              color="gray.800"
              fontWeight="600"
              lineHeight="28px"
              marginBottom={0}
            >
              Processes
            </Text>
          </HStack>
          <Box onClick={() => navigate(routes.processes.value)}>
            <Link
              color={currentTheme?.primaryColor ?? "primary.500"}
              fontSize="16px"
              fontWeight="500"
              lineHeight="24px"
              _hover={{
                color: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
            >
              View all processes
            </Link>
          </Box>
        </HStack>
        {getValidArray(mostRecentProcesses).length === 0 && (
          <EmptyResult
            title="No processes yet."
            description="You don’t have any processes."
          />
        )}
        <VStack
          spacing={0}
          alignItems="flex-start"
          alignSelf="flex-start"
          width="full"
          marginBottom="16px"
        >
          {getValidArray(mostRecentProcesses).map(
            (item: IProcessWithRelations, index: number) => {
              return (
                <GridItem
                  width="stretch"
                  key={item?.id ?? index}
                  gap={0}
                  color="gray.700"
                  transition="all 0.2s"
                  paddingX={4}
                  paddingY={3}
                  display="flex"
                  justifyContent="space-between"
                  _hover={{
                    background: "gray.50",
                    boxShadow: "sm",
                    color: currentTheme?.primaryColor ?? "primary.500",
                    transition: "all 0.2s",
                  }}
                >
                  <HStack spacing={2} alignItems="flex-start">
                    <Box width="40px" className={styles.icon}>
                      <IconBuilder icon={processIcon} size={40} isActive />
                    </Box>
                    <Text
                      fontSize="16px"
                      color="inherit"
                      fontWeight="500"
                      lineHeight="24px"
                      marginBottom={0}
                      cursor="pointer"
                      maxHeight="48px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      alignSelf="center"
                      onClick={() =>
                        navigate(
                          routes.processes.processId.value(
                            String(item?.id ?? "")
                          )
                        )
                      }
                    >
                      {item?.name ?? ""}
                    </Text>
                  </HStack>
                  <Box
                    width="32px"
                    height="32px"
                    display={{ base: "none", md: "block" }}
                  >
                    <IconButton
                      backgroundColor="#ffffff"
                      aria-label="Quick View"
                      isRound
                      size="sm"
                      border="none"
                      onClick={() =>
                        item?.id && handleOpenProcessDetail(item.id)
                      }
                      icon={<SvgIcon size={16} iconName="ic_detail" />}
                      _hover={{ backgroundColor: "#EDF2F7" }}
                    />
                  </Box>
                  <Box
                    width="24px"
                    height="24px"
                    display={{ base: "block", md: "none" }}
                  >
                    <IconButton
                      backgroundColor="#ffffff"
                      aria-label="Quick View"
                      isRound
                      border="none"
                      size="xs"
                      onClick={() =>
                        item?.id && handleOpenProcessDetail(item.id)
                      }
                      icon={<SvgIcon size={20} iconName="ic_detail"></SvgIcon>}
                      _hover={{ backgroundColor: "#EDF2F7" }}
                    />
                  </Box>
                </GridItem>
              );
            }
          )}
        </VStack>
      </VStack>
      <ProcessSummary
        isOpen={isOpenProcessDetail}
        onClose={onCloseProcessDetail}
      />
      <ModalDraftView
        isOpen={isOpenDashboard}
        onClose={onCloseDashboard}
        handleOpenProcessDetail={handleOpenProcessDetail}
      />
    </VStack>
  );
};

export default observer(DraftView);
