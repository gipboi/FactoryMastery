import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { ReactComponent as FilterIcon } from "assets/icons/filter.svg";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { debounce } from "lodash";
import { observer } from "mobx-react";
import styles from "../../styles.module.scss";
import { AuthRoleNameEnum } from "constants/user";

interface IHeaderProps {
  keyword?: string;
  setGroupKeyword: (keyword: string) => void;
  onOpenCreate: () => void;
  onOpenFilter: () => void;
}

const Header = ({
  setGroupKeyword,
  onOpenCreate,
  onOpenFilter,
}: IHeaderProps) => {
  const { groupStore, userStore } = useStores();
  const debounceSearchGroup = debounce(setGroupKeyword, 500);
  const currentTheme: ITheme = {};
  const { currentUser } = userStore;
  const isBasicUser: boolean =
    currentUser?.authRole === AuthRoleNameEnum.BASIC_USER;

  return (
    <div className={styles.groupPageAction}>
      <Flex justifyContent="space-between">
        <HStack>
          <InputGroup borderRadius="6px" background="white" width={400}>
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              type="search"
              placeholder="Search user group by name"
              onChange={(event: { currentTarget: { value: string } }) =>
                debounceSearchGroup(event.currentTarget.value)
              }
            />
          </InputGroup>

          <Button
            variant="outline"
            leftIcon={<FilterIcon width={24} height={24} />}
            background="white"
            onClick={onOpenFilter}
          >
            Filter
          </Button>
        </HStack>
        {groupStore?.isManageMode && !isBasicUser && (
          <HStack>
            <Button
              background="primary.500"
              color="white"
              textAlign="center"
              gap={{ base: 0, md: 2 }}
              _hover={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _focus={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _active={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              onClick={onOpenCreate}
            >
              <Flex height={6} alignItems="center">
                <AddIcon fontSize="12px" />
              </Flex>
              Create Group
            </Button>
          </HStack>
        )}
      </Flex>
    </div>
  );
};

export default observer(Header);
