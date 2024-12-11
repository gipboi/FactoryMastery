import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  Box,
  Divider,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import Avatar from "components/Avatar";
import EditAccountModal from "components/EditAccountModal";
import { ProfileMenuLabels } from "components/Topbar/constants";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getName } from "utils/user";
import styles from "./styles.module.scss";

interface IProfileMenuItem {
  label: ProfileMenuLabels;
  icon: string;

  redirectTo?: string;
}

interface IProfileDropdownProps {
  menuItems: IProfileMenuItem[];
}

const ProfileDropdown = (props: IProfileDropdownProps) => {
  const { authStore } = useStores();
  const { userDetail } = authStore;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenAccountModal, setIsOpenAccountModal] = useState(false);
  const imageUrl: string = userDetail?.image ?? "";
  const role: AuthRoleNameEnum =
    userDetail?.authRole ?? AuthRoleNameEnum.BASIC_USER;
  const navigate = useNavigate();

  function toggleDropdown(): void {
    setIsDropdownOpen(!isDropdownOpen);
  }

  function toggleAccountModal(): void {
    setIsOpenAccountModal(!isOpenAccountModal);
  }

  function handleToggle(itemLabel: ProfileMenuLabels): void {
    if (itemLabel === ProfileMenuLabels.ACCOUNT) {
      toggleAccountModal();
    }
  }

  return (
    <>
      <Menu>
        <MenuButton
          as={HStack}
          className={styles.menuButton}
          // aria-label="Options"
        >
          <HStack cursor="pointer">
            <Avatar name={getName(userDetail)} src={imageUrl} />
            <VStack
              spacing={0}
              minW={12}
              display="flex"
              alignItems="flex-start"
            >
              <Text fontSize="medium" fontWeight={600}>
                {getName(userDetail)}
              </Text>
              <Text fontSize="small">{userDetail?.authRole}</Text>
            </VStack>
          </HStack>
        </MenuButton>
        <MenuList className={styles.menuList} maxWidth="fit-content">
          <Box padding={2}>
            <Text marginBottom={2}>Welcome!</Text>
            <Divider margin={0} />
          </Box>
          <MenuItem
            border="none"
            onClick={() => {
              // setSelectedGroup(group);
              // onOpenEdit();
              toggleAccountModal();
            }}
            icon={<UserOutlined width={16} height={16} />}
          >
            My account
          </MenuItem>

          <MenuItem
            border="none"
            onClick={() => authStore.logout()}
            icon={<LogoutOutlined width={16} height={16} />}
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>

      <EditAccountModal
        isProfile
        isOpen={isOpenAccountModal}
        toggle={toggleAccountModal}
        userId={userDetail?.id ?? ""}
      />
    </>
  );
};

export default observer(ProfileDropdown);
