import {
  Box,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ReactComponent as DraftIcon } from "assets/icons/draft-dashboard.svg";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { observer } from "mobx-react";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
import styles from "./styles.module.scss";

interface IModalDraftView {
  isOpen: boolean;
  onClose: () => void;
  handleOpenProcessDetail: (processId: string) => void;
}
const ModalDraftView = (props: IModalDraftView) => {
  const { isOpen, onClose, handleOpenProcessDetail } = props;
  const { processStore, organizationStore } = useStores();
  const { processes } = processStore;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const navigate = useNavigate();

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
            <DraftIcon />
            <Text
              fontSize="18px"
              color="gray.800"
              fontWeight="600"
              lineHeight="28px"
              marginBottom={0}
            >
              Proccesses
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
          <VStack
            spacing={2}
            alignItems="flex-start"
            display="block"
            maxHeight="70vh"
            overflowY="auto"
          >
            {getValidArray(processes).map((item: IProcessWithRelations) => {
              return (
                <HStack
                  spacing={6}
                  minWidth="auto"
                  justifyContent="space-between"
                  key={`modal-${item.id}`}
                  paddingX={2}
                  paddingY={1}
                  color="gray.700"
                  _hover={{
                    background: "gray.50",
                    boxShadow: "sm",
                    color: currentTheme?.primaryColor ?? "primary.500",
                  }}
                >
                  <HStack spacing={4}>
                    <Box className={styles.icon}>
                      {/* <IconBuilder
                        icon={iconBuilderStore.getIconById(
                          item?.documentType?.iconId ??
                            EIconDefaultId.DOCUMENT_TYPE
                        )}
                        size={40}
                        isActive
                      /> */}
                    </Box>
                    <VStack spacing={1} alignItems="flex-start">
                      <Text
                        alignItems="center"
                        fontSize="16px"
                        color="inherit"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom={0}
                        cursor="pointer"
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
                    </VStack>
                  </HStack>
                  <HStack spacing={4} alignItems="center">
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
                        onClick={() => item && handleOpenProcessDetail(item.id)}
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

export default observer(ModalDraftView);
