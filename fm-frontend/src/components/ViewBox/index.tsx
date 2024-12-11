import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { IViewBoxItem } from "./constants";
import Avatar from "components/Avatar";

interface IViewBoxProps {
  items: IViewBoxItem[];
  link?: string;
  onClick?: () => void;
}

const ViewBox = (props: IViewBoxProps) => {
  const { items, link, onClick } = props;
  const navigate = useNavigate();
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  return (
    <HStack
      spacing={4}
      padding={2}
      width="100%"
      maxHeight="100px"
      minHeight="40px"
      background="gray.50"
      justifyContent="space-between"
      alignItems="unset"
      borderRadius={4}
    >
      <VStack
        width="100%"
        maxHeight="100px"
        overflow="auto"
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
        spacing={4}
        align="flex-start"
      >
        {items.map((item) => (
          <HStack key={item.id} width="100%" spacing={1}>
            <Avatar name={item.name} src={item.imageUrl ?? ""} />
            <Text
              marginLeft="12px !important"
              width="100%"
              color="#313A46"
              fontSize="sm"
              fontWeight={500}
              lineHeight={5}
              cursor="pointer"
              _hover={{ color: currentTheme?.primaryColor }}
              onClick={() => link && navigate(`${link}/${item.id}`)}
            >
              {item.name}
            </Text>
          </HStack>
        ))}
      </VStack>
      {onClick && (
        <Button
          padding={0}
          background="gray.50"
          border="none"
          variant="outline"
          _hover={{ borderColor: "unset" }}
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        >
          <SvgIcon
            iconName="ic-outline-zoom-out-map"
            size={16}
            onClick={onClick}
          />
        </Button>
      )}
    </HStack>
  );
};

export default observer(ViewBox);
