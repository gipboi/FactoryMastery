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
import { ReactComponent as FavoriteIcon } from "assets/icons/favorite.svg";
import imgPlaceholder from "assets/images/missing_image.png";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IProcess, IProcessWithRelations } from "interfaces/process";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import React from "react";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getValidArray } from "utils/common";
import { ITheme } from "../../../../interfaces/theme";
import styles from "./styles.module.scss";
import { blockIcon } from "components/Icon";

interface IModalFavoriteView {
  isOpen: boolean;
  onClose: () => void;
  handleOpenProcessDetail: (processId: string) => void;
  handleOpenCollectionDetail: (collectionId: string) => void;
}

const ModalFavoriteView = (props: IModalFavoriteView) => {
  const {
    isOpen,
    onClose,
    handleOpenProcessDetail,
    handleOpenCollectionDetail,
  } = props;
  const { favoriteStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { favorites } = favoriteStore;

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
            <FavoriteIcon />
            <Text
              fontSize="18px"
              color="gray.800"
              fontWeight="600"
              lineHeight="28px"
              marginBottom={0}
            >
              Your favorites
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
            {getValidArray(favorites).map((item) => {
              const collectionImage: string = item?.collection?.mainMedia ?? "";
              const collectionUrl = collectionImage
                ? (item.collection?.organizationId ?? "", collectionImage)
                : imgPlaceholder;
              const isProcess: boolean = !!item?.processId;
              const process: IProcessWithRelations =
                (item?.process as any)?.[0] ?? item?.process;
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
                    {isProcess ? (
                      <Box className={styles.icon}>
                        <IconBuilder icon={process?.documentType?.icon ?? blockIcon} size={40} isActive />
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
                        color="inherit"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom={0}
                        cursor="pointer"
                        onClick={() => {
                          isProcess
                            ? navigate(
                                routes.processes.processId.value(
                                  String(item?.processId ?? "")
                                )
                              )
                            : navigate(
                                routes.collections.collectionId.value(
                                  String(item?.collectionId ?? "")
                                )
                              );
                        }}
                      >
                        {isProcess
                          ? process?.name ?? ""
                          : item?.collection?.name ?? ""}
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
                        onClick={() =>
                          isProcess
                            ? handleOpenProcessDetail(item?.processId ?? "")
                            : handleOpenCollectionDetail(
                                item?.collectionId ?? ""
                              )
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

export default observer(ModalFavoriteView);
