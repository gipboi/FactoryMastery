import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { ReactComponent as DashboardIcon } from "assets/icons/dashboard.svg";
import { ReactComponent as DocumentTypeIcon } from "assets/icons/document-type.svg";
import { ReactComponent as GroupIcon } from "assets/icons/group.svg";
import { ReactComponent as LogoutIcon } from "assets/icons/log-out.svg";
import { ReactComponent as ProcessIcon } from "assets/icons/process.svg";
import { ReactComponent as TagIcon } from "assets/icons/tag.svg";
import { ReactComponent as UserIcon } from "assets/icons/user.svg";
import LogoIcon from "assets/images/logo-left-sidebar.png";
import TextLogoIcon from "assets/images/text-logo.png";
import cx from "classnames";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import React from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import routes from "routes";
import styles from "./leftSidebar.module.scss";

interface ILeftSidebarProps {
  showSidebarMobile: boolean;
  setShowSidebarMobile: (showSidebarMobile: boolean) => void;
}

const items = [
  {
    id: 1,
    title: "Dashboard",
    icon: <DashboardIcon width={24} height={24} />,
    link: routes.dashboard.value,
  },
];
const operationItems = [
  {
    id: 5,
    title: "Processes",
    icon: <ProcessIcon width={24} height={24} />,
    link: routes.processes.value,
  },
  {
    id: 6,
    title: "Users",
    icon: <UserIcon width={24} height={24} />,
    link: routes.users.value,
  },
  {
    id: 11,
    title: "Groups",
    icon: <GroupIcon width={24} height={24} />,
    link: routes.groups.value,
  },
];

const settingItems = [
  {
    id: 13,
    title: "Document Types",
    icon: <DocumentTypeIcon width={24} height={24} />,
    link: routes.setting.documentType.value,
  },
  {
    id: 14,
    title: "Tags",
    icon: <TagIcon width={24} height={24} />,
    link: routes.setting.tag.value,
  },
];

const LeftSidebar = (props: ILeftSidebarProps) => {
  const { showSidebarMobile, setShowSidebarMobile } = props;
  const location = useLocation();
  const { authStore } = useStores();
  const isBasicUser: boolean =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  return (
    <div
      className={cx(styles.leftSideMenu, {
        [styles.leftSideMenuMobile]: !showSidebarMobile,
      })}
    >
      <React.Fragment>
        <VStack spacing={0}>
          <Flex
            className={styles.logoSection}
            justifyContent="flex-start"
            w="full"
            paddingX={6}
            paddingY={4}
            onClick={() => setShowSidebarMobile(!showSidebarMobile)}
          >
            <HStack spacing={2}>
              {/* <img src={LogoIcon} width={24} height={24} alt="Logo" /> */}
              {showSidebarMobile ? (
                <img
                  src={TextLogoIcon}
                  width={210}
                  height={60}
                  alt="Text Logo"
                  color="$primary"
                />
              ) : (
                <img src={LogoIcon} width={30} height={45} alt="Logo" />
              )}
            </HStack>
          </Flex>
          {items.map((item) => {
            if (isBasicUser && item.link?.includes(routes.setting.value)) {
              return null;
            }
            return (
              <Link
                key={item.id}
                className={cx(styles.pageLink, {
                  [styles.pageLinkActive]: location?.pathname.includes(
                    item?.link
                  ),
                })}
                to={item.link}
              >
                <Flex
                  justifyContent={!showSidebarMobile ? "center" : "flex-start"}
                  w="full"
                  paddingX={6}
                  paddingY={4}
                >
                  <HStack spacing={2}>
                    <>{item.icon}</>
                    {showSidebarMobile && (
                      <Text className={styles.pageContent}>{item.title}</Text>
                    )}
                  </HStack>
                </Flex>
              </Link>
            );
          })}

          {/* Add Section Header for Operations */}
          {showSidebarMobile && (
            <Text className={cx(styles.sectionHeader)}>OPERATIONS</Text>
          )}
          {operationItems.map((item) => {
            if (isBasicUser && item.link?.includes(routes.setting.value)) {
              return null;
            }
            return (
              <Link
                key={item.id}
                className={cx(styles.pageLink, {
                  [styles.pageLinkActive]: location?.pathname.includes(
                    item?.link
                  ),
                })}
                to={item.link}
              >
                <Flex
                  justifyContent={!showSidebarMobile ? "center" : "flex-start"}
                  w="full"
                  paddingX={6}
                  paddingY={4}
                >
                  <HStack spacing={2}>
                    <>{item.icon}</>
                    {showSidebarMobile && (
                      <Text className={styles.pageContent}>{item.title}</Text>
                    )}
                  </HStack>
                </Flex>
              </Link>
            );
          })}

          {/* Add Section Header for Settings */}
          {showSidebarMobile && !isBasicUser && (
            <>
              <Text className={cx(styles.sectionHeader)}>SETTINGS</Text>
            </>
          )}
          {settingItems.map((item) => {
            if (isBasicUser && item.link?.includes(routes.setting.value)) {
              return null;
            }
            return (
              <Link
                key={item.id}
                className={cx(styles.pageLink, {
                  [styles.pageLinkActive]: location?.pathname.includes(
                    item?.link
                  ),
                })}
                to={item.link}
              >
                <Flex
                  justifyContent={!showSidebarMobile ? "center" : "flex-start"}
                  w="full"
                  paddingX={6}
                  paddingY={4}
                >
                  <HStack spacing={2}>
                    <>{item.icon}</>
                    {showSidebarMobile && (
                      <Text className={styles.pageContent}>{item.title}</Text>
                    )}
                  </HStack>
                </Flex>
              </Link>
            );
          })}

          {/* {showSidebarMobile && (
            <hr className={styles.separator} style={{ marginTop: "24px" }} />
          )} */}
          <Link
            className={cx(styles.pageLink, {
              [styles.pageLinkActive]: !!matchPath(
                location?.pathname,
                routes.logout.value
              ),
            })}
            to={routes.logout.value}
            onClick={(e) => {
              e.preventDefault();
              authStore.logout();
            }}
          >
            <Flex
              justifyContent={!showSidebarMobile ? "center" : "flex-start"}
              w="full"
              paddingX={6}
              paddingY={4}
            >
              <HStack spacing={2}>
                <LogoutIcon width={24} height={24} />
                {showSidebarMobile && (
                  <Text className={styles.pageContent}>Log out</Text>
                )}
              </HStack>
            </Flex>
          </Link>
        </VStack>
      </React.Fragment>
    </div>
  );
};

export default observer(LeftSidebar);
