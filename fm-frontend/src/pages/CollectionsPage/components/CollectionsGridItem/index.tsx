import { Checkbox, IconButton, Image, Text, VStack } from "@chakra-ui/react";
import icon from "assets/icons/collections.svg";
import imgPlaceholder from "assets/images/missing_image.png";
import SvgIcon from "components/SvgIcon";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { CollectionsGridItemProps } from "pages/CollectionsPage/types";
import { useNavigate } from "react-router";
import routes from "routes";
import { primary } from "themes/globalStyles";
import { ReactComponent as InfoIcon } from "../../../../assets/icons/info.svg";
import { ITheme } from "../../../../interfaces/theme";
import styles from "./collectionsGridItem.module.scss";

const CollectionsGridItem = (props: CollectionsGridItemProps) => {
  const {
    collection,
    isManageMode,
    isSelected,
    openShareModal,
    handleSelectItem,
    onClick = () => {},
  } = props;
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const mainImg = collection.mainMedia
    ? (organizationStore.organization?.id ?? "", collection.mainMedia)
    : imgPlaceholder;
  const navigate = useNavigate();

  function goToDetailPage(): void {
    navigate(routes.collections.collectionId.value(String(collection?.id)));
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
      spacing={0}
      borderRadius={8}
      align="flex-start"
      background="white"
      position="relative"
      border="2px solid"
      borderColor={
        isSelected ? currentTheme.primaryColor ?? primary : "#edf2f7"
      }
      boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
      className={styles.collectionGridItem}
    >
      <IconButton
        aria-label="Summary"
        background="whiteAlpha.500"
        border={0}
        icon={<InfoIcon />}
        onClick={() => onClick(collection)}
        position="absolute"
        top={2}
        right={2}
        zIndex={2}
      />
      {isManageMode && (
        <>
          <IconButton
            aria-label="Share"
            background="whiteAlpha.500"
            border={0}
            onClick={openShareModal}
            icon={<SvgIcon width={20} height={20} iconName="ic_share" />}
            position="absolute"
            top={14}
            right={2}
            zIndex={2}
          />
          <Checkbox
            isFocusable={false}
            isChecked={isSelected}
            onChange={handleSelectItem}
            borderRadius={2}
            border="2px solid"
            borderColor={
              isSelected ? currentTheme?.primaryColor ?? primary : "gray.200"
            }
            background={
              isSelected ? currentTheme?.primaryColor ?? primary : "white"
            }
            position="absolute"
            top={4}
            left={4}
          />
        </>
      )}
      <Image
        src={mainImg}
        borderTopRadius={6}
        onError={onImgError}
        onClick={goToDetailPage}
        objectFit="contain"
      />
      <VStack
        h="full"
        align="flex-start"
        justify="space-between"
        paddingX={4}
        paddingY={3}
        onClick={goToDetailPage}
      >
        <Text
          color={
            isSelected ? currentTheme?.primaryColor ?? primary : "gray.700"
          }
          fontSize="md"
          fontWeight={500}
          margin={0}
          _hover={{ color: currentTheme?.primaryColor ?? primary }}
        >
          {collection?.name}
        </Text>
        <Text color="gray.700" fontSize="md" fontWeight={400}>
          {dayjs(collection?.updatedAt).format("MM/DD/YYYY")}
        </Text>
      </VStack>
    </VStack>
  );
};

export default CollectionsGridItem;
