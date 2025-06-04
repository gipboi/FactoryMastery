/* eslint-disable max-lines */
import {
  Box,
  Button,
  Grid,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { IDocumentType } from "interfaces/documentType";
import { EIconShape, EIconType } from "interfaces/iconBuilder";
import { ITheme } from "interfaces/theme";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import { observer } from "mobx-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { primary, primary500, primary700 } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import ChooseColorIcon from "../../../../assets/images/choose-color.png";
import { colors, iconNames } from "../../constants";

import IconBuilder from "../IconBuilder";
import DeleteModal from "./DeleteModal";
interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: EIconType;
}
const DetailModal = ({ isOpen, onClose, type }: IDetailModalProps) => {
  const title =
    type === EIconType.DOCUMENT_TYPE
      ? "document type"
      : type === EIconType.STEP
      ? "step"
      : "block";
  const { iconBuilderStore, authStore, organizationStore } = useStores();
  const { iconDetail, selectedIcon = { shape: EIconShape.SQUARE } } =
    iconBuilderStore;
  const { userDetail } = authStore;
  const inputColorRef = useRef<any>(null);
  const [customColor, setCustomColor] = useState<string[]>([]);
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();
  const isDefaultIcon: boolean = iconDetail?.isDefaultIcon ?? false;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  function handleClose(): void {
    iconBuilderStore.setSelectedIcon({ shape: EIconShape.SQUARE });
    iconBuilderStore.resetIconDetail();
    onCloseDelete();
    onClose();
  }

  useEffect(() => {
    return () => {
      iconBuilderStore.resetIconDetail();
      iconBuilderStore.setSelectedIcon({ shape: EIconShape.SQUARE });
    };
  }, []);

  async function onSave(): Promise<void> {
    try {
      if (!selectedIcon) {
        throw new Error("Please select icon");
      }
      if (
        !selectedIcon?.color ||
        !selectedIcon?.iconName ||
        !selectedIcon?.shape
      ) {
        throw new Error("Please select icon");
      }
      if (iconDetail?.id ?? iconDetail?._id) {
        await iconBuilderStore.updateIcon(iconDetail?._id ?? "", {
          ...omit(iconDetail, "documentTypes"),
          ...omit(selectedIcon, "documentTypes"),
          type,
        });
        toast.success("Icon updated successfully");
      } else {
        await iconBuilderStore.createNewIcon({ ...selectedIcon, type });
        toast.success("Icon created successfully");
      }
      await iconBuilderStore.fetchCMSIconList([
        {
          $match: {
            $expr: {
              $eq: [
                "$organizationId",
                {
                  $toObjectId: organization?.id,
                },
              ],
            },
          },
        },
      ]);
      handleClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
    }
  }

  useEffect(() => {
    iconBuilderStore.setSelectedIcon({
      ...selectedIcon,
      shape:
        type === EIconType.DOCUMENT_TYPE
          ? EIconShape.SQUARE
          : EIconShape.CIRCLE,
    });
  }, [type]);

  function handleInputColor(): void {
    inputColorRef?.current?.click();
  }

  function onSelectColor(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.value) {
      return;
    }
    setCustomColor([...customColor, event.target.value]);
    iconBuilderStore.setSelectedIcon({
      ...selectedIcon,
      iconName: selectedIcon?.iconName ?? "",
      color: event.target.value,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalOverlay zIndex={10000} />
      <ModalContent
        maxWidth="800px"
        containerProps={{
          zIndex: 10000,
        }}
      >
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          fontWeight="500"
          lineHeight="28px"
          display="center"
        >
          <Text marginBottom="0">
            {iconDetail?._id ? "Edit" : "Create"} {title} icon
          </Text>
        </ModalHeader>
        <ModalCloseButton
          width="40px"
          height="40px"
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <ModalBody border="1px solid #E2E8F0" padding={6}>
          <VStack spacing={6} width="full" alignItems="flex-start">
            {!isDefaultIcon && (
              <VStack spacing={4} width="full" alignItems="flex-start">
                <Text
                  color="gray.700"
                  lineHeight="24px"
                  fontSize="16px"
                  fontWeight="500"
                  marginBottom="0"
                >
                  Icon shape
                </Text>
                {type === EIconType.DOCUMENT_TYPE ? (
                  <RadioGroup
                    onChange={() =>
                      iconBuilderStore.setSelectedIcon({
                        ...selectedIcon,
                        shape: EIconShape.SQUARE,
                      })
                    }
                    value={EIconShape.SQUARE}
                    paddingBottom="0"
                    defaultValue={EIconShape.SQUARE}
                  >
                    <Radio
                      colorScheme="primary"
                      value={EIconShape.SQUARE}
                      isChecked={selectedIcon?.shape === EIconShape.SQUARE}
                      marginBottom={0}
                    >
                      Square
                    </Radio>
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    onChange={(value) =>
                      iconBuilderStore.setSelectedIcon({
                        ...selectedIcon,
                        shape: value as EIconShape,
                      })
                    }
                    value={selectedIcon?.shape}
                    paddingBottom="0"
                    defaultValue={EIconShape.CIRCLE}
                  >
                    <HStack
                      display="center"
                      spacing={6}
                      width="full"
                      marginBlock={1}
                    >
                      <Radio
                        colorScheme="primary"
                        value={EIconShape.CIRCLE}
                        isChecked={selectedIcon?.shape === EIconShape.CIRCLE}
                        marginRight={10}
                      >
                        Circle
                      </Radio>
                      <Radio
                        colorScheme="primary"
                        value={EIconShape.SQUARE}
                        isChecked={selectedIcon?.shape === EIconShape.SQUARE}
                        marginRight={10}
                      >
                        Square
                      </Radio>
                      <Radio
                        colorScheme="primary"
                        value={EIconShape.DIAMOND}
                        isChecked={selectedIcon?.shape === EIconShape.DIAMOND}
                        marginRight={10}
                      >
                        Diamond
                      </Radio>
                      <Radio
                        colorScheme="primary"
                        value={EIconShape.OCTAGON}
                        isChecked={selectedIcon?.shape === EIconShape.OCTAGON}
                      >
                        Octagon
                      </Radio>
                    </HStack>
                  </RadioGroup>
                )}
              </VStack>
            )}
            <Stack
              flexDirection={{ base: "column", md: "row" }}
              width="full"
              spacing={6}
              alignItems="flex-start"
            >
              {!isDefaultIcon && (
                <VStack spacing={2} flex={1} alignItems="flex-start">
                  <Text
                    color="#2D3748"
                    fontSize="16px"
                    fontWeight="500"
                    lineHeight="24px"
                    marginBottom="0"
                  >
                    Select icon glyph
                  </Text>
                  <Grid
                    templateColumns={{
                      base: "repeat(5, 1fr)",
                      sm: "repeat(8, 1fr)",
                    }}
                    background="#F7FAFC"
                    padding="16px"
                    gap={4}
                    flexWrap="wrap"
                  >
                    {iconNames.map((iconName: string, index) => {
                      const isSelected = selectedIcon?.iconName === iconName;
                      return (
                        <Box
                          _hover={{ opacity: 1, transition: "all 0.3s ease" }}
                          opacity={isSelected ? 1 : 0.3}
                          transition="all 0.3s ease"
                          key={iconName}
                          name-icon={iconName}
                          onClick={() => {
                            iconBuilderStore.setSelectedIcon({
                              ...selectedIcon,
                              iconName: iconName,
                              color:
                                selectedIcon?.color ||
                                (currentTheme?.primaryColor ?? primary),
                            });
                          }}
                        >
                          <SvgIcon key={index} iconName={iconName} size={32} />
                        </Box>
                      );
                    })}
                  </Grid>
                </VStack>
              )}
              <VStack spacing={6} alignItems="flex-start">
                <VStack spacing={2} alignItems="flex-start">
                  <Text
                    color="#2D3748"
                    fontSize="16px"
                    fontWeight="500"
                    lineHeight="24px"
                    marginBottom="0"
                  >
                    Select background color
                  </Text>
                  <Grid
                    templateColumns={{
                      base: "repeat(4, 1fr)",
                      sm: "repeat(8, 1fr)",
                    }}
                    background="#F7FAFC"
                    padding="16px"
                    gap={3}
                  >
                    {colors.map((color, index) => {
                      const isSelected = selectedIcon?.color === color;
                      return (
                        <Box
                          width="26px"
                          height={26}
                          _hover={{ opacity: 1, transition: "all 0.3s ease" }}
                          opacity={isSelected ? 1 : 0.3}
                          transition="all 0.3s ease"
                          onClick={() => {
                            iconBuilderStore.setSelectedIcon({
                              ...selectedIcon,
                              iconName: selectedIcon?.iconName ?? "",
                              color:
                                color ||
                                (currentTheme?.primaryColor ?? primary),
                            });
                          }}
                        >
                          <Text
                            key={index}
                            width="32px"
                            height="32px"
                            borderRadius="50%"
                            background={color}
                          ></Text>
                        </Box>
                      );
                    })}
                    <Box
                      width="26px"
                      height={26}
                      transition="all 0.3s ease"
                      onClick={handleInputColor}
                      position="relative"
                    >
                      <img src={ChooseColorIcon} alt="choose color" />
                      <input
                        ref={inputColorRef}
                        type="color"
                        value="#e66465"
                        autoFocus
                        style={{
                          visibility: "hidden",
                        }}
                        onChange={onSelectColor}
                      />
                    </Box>
                  </Grid>
                </VStack>
                <HStack>
                  <Switch
                    margin={0}
                    isChecked={selectedIcon?.isDark}
                    size="lg"
                    onChange={(event) => {
                      iconBuilderStore.setSelectedIcon({
                        ...selectedIcon,
                        isDark: event.target.checked,
                      });
                    }}
                  />
                  <Text
                    color="gray.800"
                    fontSize="md"
                    fontWeight={500}
                    lineHeight={6}
                  >
                    Dark icon
                  </Text>
                </HStack>
              </VStack>
            </Stack>
            <VStack spacing={2} alignItems="flex-start">
              <Text
                color="gray.700"
                fontSize="16px"
                fontWeight="500"
                lineHeight="24px"
              >
                Review Icon
              </Text>
              <IconBuilder
                icon={selectedIcon?.iconName ? selectedIcon : iconDetail}
                isActive
              />
            </VStack>

            <VStack width="full" alignItems="flex-start">
              <Text
                color="gray.700"
                fontSize="16px"
                fontWeight="500"
                lineHeight="24px"
                margin="0"
              >
                Description (optional)
              </Text>
              <Input
                placeholder="Enter description"
                value={selectedIcon?.description}
                onChange={(e) => {
                  iconBuilderStore.setSelectedIcon({
                    ...selectedIcon,
                    description: e.target.value,
                  });
                }}
                _focus={{ borderColor: currentTheme?.primaryColor ?? primary }}
              />
              {type === EIconType.DOCUMENT_TYPE && (
                <VStack
                  width="full"
                  alignItems="flex-start"
                  paddingTop="16px"
                  hidden={!!!iconDetail?.id}
                >
                  <Text
                    color="gray.700"
                    fontSize="16px"
                    fontWeight="500"
                    lineHeight="24px"
                    marginBottom="0"
                  >
                    Used by
                  </Text>
                  <Grid
                    width="full"
                    templateColumns="repeat(2, 1fr)"
                    background="#F7FAFC"
                    padding="16px"
                    flexWrap="wrap"
                    gap="12px 24px"
                  >
                    {uniqBy(getValidArray(iconDetail?.documentTypes), "name")
                      ?.filter(
                        (documentType: IDocumentType) =>
                          !documentType?.isDeleted &&
                          documentType?.organizationId ===
                            userDetail?.organizationId
                      )
                      .map((documentType: IDocumentType) => (
                        <Text
                          color="#2D3748"
                          fontSize="16px"
                          fontWeight="500"
                          lineHeight="24px"
                          marginBottom="0"
                        >
                          {documentType?.name}
                        </Text>
                      ))}
                    {getValidArray(iconDetail?.documentTypes)?.length === 0 && (
                      <Text
                        color="#2D3748"
                        fontSize="16px"
                        fontWeight="500"
                        lineHeight="24px"
                        marginBottom="0"
                      >
                        N/A
                      </Text>
                    )}
                  </Grid>
                </VStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack justifyContent="space-between" width="full">
            <Button
              variant="ghost"
              color="red.500"
              fontSize="16px"
              lineHeight="24px"
              fontWeight="500"
              backgroundColor="#FFFFFF"
              border="unset"
              height="40px"
              hidden={!iconDetail?._id}
              onClick={onOpenDelete}
              disabled={isDefaultIcon}
            >
              Delete Icon
            </Button>
            <DeleteModal
              onClose={handleClose}
              isOpen={isOpenDelete}
              closeEditModal={handleClose}
            />
            <HStack spacing={4} justifyContent="flex-end" width="full">
              <Button
                variant="outline"
                borderRadius="6px"
                color="gray.700"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="500"
                backgroundColor="#FFFFFF"
                border="1px solid #E2E8F0"
                height="40px"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                borderRadius="6px"
                fontSize="16px"
                color="#FFFFFF"
                lineHeight="24px"
                fontWeight="500"
                backgroundColor={currentTheme?.primaryColor ?? primary500}
                height="40px"
                _hover={{
                  backgroundColor: currentTheme?.primaryColor ?? primary700,
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                onClick={onSave}
              >
                {iconDetail?._id ? "Save" : "Create"}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default observer(DetailModal);
