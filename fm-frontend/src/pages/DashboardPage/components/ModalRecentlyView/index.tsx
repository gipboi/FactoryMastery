import {
  Box,
  HStack,
  IconButton,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import icon from "assets/icons/collections.svg";
import { ReactComponent as EyeIcon } from "assets/icons/eye-icon.svg";
import imgPlaceholder from "assets/images/missing_image.png";
import ProcedureIcon from "components/Common/ProcedureIcon";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { EAuditableType } from "interfaces/user";
import { observer } from "mobx-react";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import React from "react";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
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

interface IModalRecentlyView {
  isOpen: boolean;
  onClose: () => void;
  handleOpenProcessDetail: (process: IProcessWithRelations) => void;
  handleOpenCollectionDetail: (collectionId: string) => void;
}
const ModalRecentlyView = (props: IModalRecentlyView) => {
  const {
    isOpen,
    onClose,
    handleOpenProcessDetail,
    handleOpenCollectionDetail,
  } = props;
  const { userStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { recentAudits } = userStore;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const navigate = useNavigate();

  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== icon) {
      evt.currentTarget.src = icon;
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      blockScrollOnMount={false}
      preserveScrollBarGap={true}
    >
      <ModalOverlay zIndex={10000} />
      <ModalContent
        containerProps={{
          zIndex: 10000,
        }}
      >
        <ModalHeader
          color="gray.800"
          fontWeight="500"
          fontSize="18px"
          lineHeight="28px"
          fontStyle="normal"
          borderBottom="1px solid #E2E8F0"
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
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "#fff", borderColor: "unset" }}
        />
        <ModalBody padding={6}>
          <VStack spacing={2} alignItems="flex-start" display="inline">
            {getValidArray(recentAudits).map((item) => {
              const collectionImage: string = item?.collection?.mainMedia ?? "";
              const collectionUrl = collectionImage
                ? (item.collection?.organizationId ?? "", collectionImage)
                : imgPlaceholder;
              const isProcess: boolean =
                item.auditableType ===
                EAuditableType.STANDARD_OPERATING_PROCEDURE;
              return (
                <HStack
                  spacing={6}
                  minWidth="auto"
                  justifyContent="space-between"
                  key={item.id}
                  paddingX={2}
                  paddingY={1}
                >
                  <HStack spacing={4}>
                    {isProcess ? (
                      <Box className={styles.icon}>
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
                      <Box width="40px" height="40px" alignItems="flex-start">
                        <Img
                          src={collectionUrl}
                          onError={onImgError}
                          width="40px"
                          height="40px"
                          borderRadius="8px"
                        />
                      </Box>
                    )}
                    <VStack spacing={1} alignItems="flex-start">
                      <Text
                        alignItems="center"
                        fontSize="16px"
                        color="gray.700"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom={0}
                        cursor="pointer"
                        _hover={{
                          color: currentTheme?.primaryColor ?? "primary.500",
                        }}
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
                          : item?.collection?.name ?? ""}
                      </Text>
                      <Text
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="500"
                        lineHeight="16px"
                        hidden={!isMobile}
                      >
                        Viewed {dayjs(item?.createdAt).fromNow()}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={4} alignItems="center">
                    <Text
                      alignItems="center"
                      color="gray.500"
                      fontSize="12px"
                      fontWeight="500"
                      lineHeight="16px"
                      hidden={isMobile}
                      marginBottom={0}
                    >
                      Viewed {dayjs(item?.createdAt).fromNow()}
                    </Text>
                    <Box
                      width={{ base: "24px", md: "40px" }}
                      height={{ base: "24px", md: "40px" }}
                    >
                      <IconButton
                        backgroundColor="#ffffff"
                        aria-label="Quick View"
                        border="none"
                        isRound
                        size={isMobile ? "xs" : "md"}
                        onClick={() =>
                          isProcess && item?.process
                            ? handleOpenProcessDetail(item.process)
                            : handleOpenCollectionDetail(item?.auditableId ?? 0)
                        }
                        icon={<SvgIcon size={20} iconName="ic_detail" />}
                        _hover={{ backgroundColor: "#EDF2F7" }}
                      />
                    </Box>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default observer(ModalRecentlyView);
