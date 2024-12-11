import { HStack, Text, Tooltip, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useFormContext, useWatch } from "react-hook-form";
// import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder'
import { BlockTextFormValues } from "../../enums";
import IconBuilder from "components/IconBuilder";
import { primary500 } from "themes/globalStyles";
import { EIconShape, EIconType, IIconBuilder } from "interfaces/iconBuilder";
import { blockIcon } from "components/Icon";

const IconSection = () => {
  const { setValue, control } = useFormContext();
  // const { iconBuilderStore } = useStores()
  // const { blockIcons } = iconBuilderStore
  const iconId: number =
    useWatch({ control, name: BlockTextFormValues.ICON_ID }) || null;

  return (
    <VStack alignItems="flex-start" spacing={2} paddingY={4}>
      <Text
        color="gray.700"
        as="b"
        fontSize="md"
        marginBottom={0}
      >
        Block Icon
      </Text>
      <HStack spacing={0} gap={3} width="full" flexWrap="wrap">
        {/* {getValidArray(blockIcons).map(icon => {
          return (
            <IconBuilder
              key={`icon-preview-${icon?.id}`}
              icon={icon}
              size={40}
              isActive={Number(iconId) === Number(icon?.id)}
              onClick={() => setValue(BlockTextFormValues.ICON_ID, icon.id)}
            />
          )
        })} */}

        <IconBuilder
          key={`icon-preview-${blockIcon?.id}`}
          icon={blockIcon}
          size={40}
          isActive={true}
          onClick={() => setValue(BlockTextFormValues.ICON_ID, blockIcon.id)}
        />
      </HStack>
    </VStack>
  );
};

export default observer(IconSection);
