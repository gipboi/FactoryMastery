import {
  Box,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Link,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import icon from "assets/icons/collections.svg";
import { ReactComponent as EyeIcon } from "assets/icons/eye-icon.svg";
import ProcedureIcon from "components/Common/ProcedureIcon";
import ProcessSummary from "components/Common/ProcessSummary";
// import CollectionOverview from "components/Pages/CollectionsPage/CollectionOverview";
import SvgIcon from "components/SvgIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { EAuditableType, IAuditWithRelations } from "interfaces/user";
import { observer } from "mobx-react";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
import ModalRecentlyView from "../ModalRecentlyView";
import styles from "./styles.module.scss";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few secs",
    m: "a min",
    mm: "%d mins",
    h: "an hr",
    hh: "%d hrs",
    d: "a day",
    dd: "%d days",
    M: "a mo",
    MM: "%d mos",
    y: "a yr",
    yy: "%d yrs",
  },
});

const RecentView = () => {
  const [selectedCollectionId, setSelectedCollectionId] =
    React.useState<string>("");
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
    isOpen: isOpenCollectionDetail,
    onOpen: onOpenCollectionDetail,
    onClose: onCloseCollectionDetail,
  } = useDisclosure();
  const { userStore, processStore, organizationStore } = useStores();
  const { recentAudits } = userStore;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const navigate = useNavigate();

  const getRecentlyViewed = async () => {
    await userStore.fetchRecentlyViewed();
  };

  useEffect(() => {
    getRecentlyViewed();
  }, []);

  const mostRecentAudits: IAuditWithRelations[] =
    getValidArray<IAuditWithRelations>(recentAudits).slice(0, 4);

  function handleOpenProcessDetail(process: IProcessWithRelations): void {
    processStore.setSelectedProcess(process);
    processStore.setSelectedProcessId(process.id);
    onOpenProcessDetail();
  }

  function handleOpenCollectionDetail(collectionId: string): void {
    if (collectionId) {
      setSelectedCollectionId(collectionId);
      onOpenCollectionDetail();
    }
  }
  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== icon) {
      evt.currentTarget.src = icon;
    }
  }

  return (
    <VStack
      backgroundColor=" #FFFFFF"
      margin-top="16px"
      borderRadius="8px"
      gap={4}
      width="full"
      hidden={!recentAudits?.length}
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
            <EyeIcon />
            <Text
              fontSize="18px"
              color="gray.800"
              fontWeight="600"
              lineHeight="28px"
              marginBottom={0}
            >
              Recently viewed
            </Text>
          </HStack>
          <Box onClick={onOpenDashboard}>
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
              View more
            </Link>
          </Box>
        </HStack>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
          marginBottom="16px"
          width="full"
        >
          {getValidArray(mostRecentAudits).map(
            (item: IAuditWithRelations, index: number) => {
              // const collectionImage: string = item?.collection?.mainMedia ?? "";
              // const collectionUrl: string = collectionImage
              //   ? getS3FileUrl(
              //       S3FileTypeEnum.IMAGE,
              //       item.collection?.organizationId ?? 0,
              //       collectionImage
              //     )
              //   : imgPlaceholder;
              const isProcess: boolean =
                item.auditableType ===
                EAuditableType.STANDARD_OPERATING_PROCEDURE;
              return (
                <GridItem
                  width="stretch"
                  key={item?.id ?? item?.auditableId ?? index}
                  gap={2}
                  display="flex"
                  justifyContent="space-between"
                >
                  <HStack spacing={2} alignItems="flex-start">
                    {item.auditableType ===
                    EAuditableType.STANDARD_OPERATING_PROCEDURE ? (
                      <Box width="40px" height="48px" className={styles.icon}>
                        {item?.process?.documentType?.iconBuilder ? (
                          // <IconBuilder
                          //   icon={item?.process?.documentType?.iconBuilder}
                          //   size={40}
                          //   isActive
                          // />
                          <></>
                        ) : (
                          <ProcedureIcon
                            procedureIcon={item?.process?.procedureIcon}
                            size={40}
                          />
                        )}
                      </Box>
                    ) : (
                      <Box width="40px" height="48px" alignItems="flex-start">
                        {/* <Img
                          src={collectionUrl}
                          onError={onImgError}
                          width="40px"
                          height="40px"
                          borderRadius="8px"
                          marginTop={1}
                        /> */}
                      </Box>
                    )}
                    <VStack spacing={1} alignItems="flex-start">
                      <Text
                        fontSize="16px"
                        color="gray.700"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom={0}
                        cursor="pointer"
                        _hover={{
                          color: currentTheme?.primaryColor ?? "primary.500",
                        }}
                        maxHeight="48px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        onClick={() => {
                          isProcess
                            ? navigate(
                                routes.processes.processId.value(
                                  String(item?.auditableId ?? "")
                                )
                              )
                            : navigate(
                                routes.collections.collectionId.value(
                                  String(item?.auditableId ?? "")
                                )
                              );
                        }}
                      >
                        {item.auditableType ===
                        EAuditableType.STANDARD_OPERATING_PROCEDURE
                          ? item?.process?.name ?? ""
                          : item?.["collection"]?.["name"] ?? ""}
                      </Text>
                      <Text
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="500"
                        lineHeight="16px"
                      >
                        Viewed {dayjs(item?.createdAt).fromNow()}
                      </Text>
                    </VStack>
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
                        isProcess && item?.process
                          ? handleOpenProcessDetail(item?.process)
                          : handleOpenCollectionDetail(item?.auditableId ?? "")
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
                        isProcess && item?.process
                          ? handleOpenProcessDetail(item?.process)
                          : handleOpenCollectionDetail(item?.auditableId ?? "")
                      }
                      icon={<SvgIcon size={20} iconName="ic_detail"></SvgIcon>}
                      _hover={{ backgroundColor: "#EDF2F7" }}
                    />
                  </Box>
                </GridItem>
              );
            }
          )}
        </Grid>
      </VStack>
      <ModalRecentlyView
        isOpen={isOpenDashboard}
        onClose={onCloseDashboard}
        handleOpenProcessDetail={handleOpenProcessDetail}
        handleOpenCollectionDetail={handleOpenCollectionDetail}
      />
      <ProcessSummary
        isOpen={isOpenProcessDetail}
        onClose={onCloseProcessDetail}
      />

      {/* <CollectionOverview
        collectionId={selectedCollectionId}
        toggle={
          isOpenCollectionDetail
            ? onCloseCollectionDetail
            : onOpenCollectionDetail
        }
        isOpen={isOpenCollectionDetail}
        isCentered
      /> */}
    </VStack>
  );
};

export default observer(RecentView);
