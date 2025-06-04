import { HStack, Text, VStack } from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useFormContext, useWatch } from "react-hook-form";
import { getValidArray } from "utils/common";
import { BlockTextFormValues } from "../../enums";

const IconSection = () => {
  const { setValue, control } = useFormContext();
  const { iconBuilderStore } = useStores();
  const { blockIcons } = iconBuilderStore;
  const iconId: string =
    useWatch({ control, name: BlockTextFormValues.ICON_ID }) || null;

  return (
    <VStack alignItems="flex-start" spacing={2} paddingY={4}>
      <Text color="gray.700" as="b" fontSize="md" marginBottom={0}>
        Block Icon
      </Text>
      <HStack spacing={0} gap={3} width="full" flexWrap="wrap">
        {getValidArray(blockIcons).map((icon) => {
          return (
            <IconBuilder
              key={`icon-preview-${icon?._id}`}
              icon={icon}
              size={40}
              isActive={String(iconId) === String(icon?._id)}
              onClick={() => {
                setValue(BlockTextFormValues.ICON_ID, icon._id);
              }}
            />
          );
        })}

        {/* <IconBuilder
          key={`icon-preview-${blockIcon?.id}`}
          icon={blockIcon}
          size={40}
          isActive={true}
          onClick={() => setValue(BlockTextFormValues.ICON_ID, blockIcon.id)}
        /> */}
      </HStack>
    </VStack>
  );
};

export default observer(IconSection);
