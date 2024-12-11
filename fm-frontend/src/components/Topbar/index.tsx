import { ChevronRightIcon } from "@chakra-ui/icons";
import { Divider, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { ReactComponent as CollapseIcon } from "assets/icons/collapse.svg";
import { ReactComponent as ExpandIcon } from "assets/icons/expand.svg";
import cx from "classnames";
import HeaderBar from "components/HeaderBar";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import ProfileDropdown from "./components/ProfileDropdown";
import { profileMenus } from "./constants";
import styles from "./topSidebar.module.scss";
import { ReactComponent as FavoriteIcon } from "assets/icons/favorite.svg";
import { ReactComponent as UnFavoriteIcon } from "assets/icons/un_favorite.svg";
import { toggleFavorite } from "API/favorite";
import SvgIcon from "components/SvgIcon";
import { getName } from "utils/user";
import NotificationBell from "./components/NotificationBell";

interface ITopBarProps {
  showSidebarMobile: boolean;
  setShowSidebarMobile: () => void;
}

const TopBar = (props: ITopBarProps) => {
  const { showSidebarMobile, setShowSidebarMobile } = props;
  const { userStore, groupStore, processStore, favoriteStore } = useStores();
  const { process } = processStore;
  const navigate = useNavigate();
  const location = useLocation();
  const isProcessArchived = process?.archivedAt && process?.archivedAt !== null;
  const [isProcessFavorite, setIsProcessFavorite] =
    React.useState<boolean>(false);

  function toggleFavoriteProcess(): void {
    setIsProcessFavorite(!isProcessFavorite);
    toggleFavorite({ processId: process?.id });
  }

  useEffect(() => {
    process?.id &&
      favoriteStore.getIsFavorite({ processId: process?.id }).then((res) => {
        setIsProcessFavorite(res);
      });
  }, [process]);

  return (
    <React.Fragment>
      <div
        className={cx(styles.topBarWrapper, {
          [styles.topBarWrapperMobile]: !showSidebarMobile,
        })}
      >
        <Stack display="flex" spacing={0}>
          <Flex
            className={styles.commonHeader}
            justifyContent="space-between"
            alignItems="center"
            paddingX={8}
          >
            <HStack spacing={6}>
              {showSidebarMobile ? (
                <CollapseIcon
                  width={32}
                  height={32}
                  cursor="pointer"
                  onClick={setShowSidebarMobile}
                />
              ) : (
                <ExpandIcon
                  width={32}
                  height={32}
                  cursor="pointer"
                  fill="black"
                  onClick={setShowSidebarMobile}
                />
              )}

              {/* <InputGroup borderRadius="6px" background="white" width={400}>
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.400" />
                </InputLeftElement>
                <Input
                  type="search"
                  placeholder="Search..."
                  onChange={(event) => {
                    // setProcessKeyword(event?.currentTarget?.value)
                  }}
                />
              </InputGroup> */}

              {/* <Button variant="outline">Show All</Button> */}
            </HStack>
            <HStack spacing={6}>
              {/* TODO: Handle notification in phase 2 */}
              <NotificationBell />
              <ProfileDropdown menuItems={profileMenus} />
            </HStack>
          </Flex>
          <Divider margin={0} />

          <Flex
            justifyContent="space-between"
            alignItems="center"
            paddingX={8}
            className={styles.pageHeader}
          >
            
            {/* -----------PROCESS-------------- */}
            {!!matchPath(location?.pathname, routes.processes.value) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.processes.value, { replace: true })
                      }
                    >
                      Processes
                    </Text>
                  </HStack>
                }
                controlBy="processList"
              />
            )}

            {/* -----------PROCESS DETAIL-------------- */}
            {!!matchPath(
              `${routes.processes.value}/:processId`,
              location?.pathname
            ) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      color={"primary.700"}
                      onClick={() =>
                        navigate(routes.processes.value, { replace: true })
                      }
                    >
                      Processes
                    </Text>
                    {processStore?.process && (
                      <>
                        <ChevronRightIcon />
                        <Text color="gray.700" fontWeight={600}>
                          {processStore?.process?.name ?? ""}
                        </Text>
                      </>
                    )}
                    <HStack paddingLeft={{ base: 7, md: 0 }}>
                      <span className={styles.tagContainer}>{`v${
                        process?.version ?? "1.0.0"
                      }`}</span>
                      {isProcessArchived && (
                        <span
                          className={cx(styles.tagContainer, styles.archive)}
                        >
                          Archived
                        </span>
                      )}
                      {isProcessFavorite ? (
                        <FavoriteIcon
                          cursor="pointer"
                          onClick={toggleFavoriteProcess}
                        />
                      ) : (
                        <UnFavoriteIcon
                          cursor="pointer"
                          onClick={toggleFavoriteProcess}
                        />
                      )}
                    </HStack>
                  </HStack>
                }
                controlBy="processDetail"
              />
            )}

            {/* ------------USER------------- */}
            {!!matchPath(location?.pathname, routes.users.value) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.users.value, { replace: true })
                      }
                    >
                      Users
                    </Text>
                  </HStack>
                }
                controlBy="userPage"
                isManageMode={userStore.isManageMode}
              />
            )}

            {/* ------------USER DETAIL------------- */}
            {!!matchPath("/users/:userId", location?.pathname) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      color={"primary.700"}
                      onClick={() =>
                        navigate(routes.users.value, { replace: true })
                      }
                    >
                      Users
                    </Text>
                    {userStore?.userDetail && (
                      <>
                        <ChevronRightIcon />
                        <Text color="gray.700">
                          {getName(userStore?.userDetail) ?? ""}
                        </Text>
                      </>
                    )}
                  </HStack>
                }
                controlBy="userDetailPage"
                isManageMode={userStore.isManageModeInUserDetail}
              />
            )}

            {/* -------------GROUP------------ */}
            {!!matchPath(location?.pathname, routes.groups.value) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.groups.value, { replace: true })
                      }
                    >
                      Groups
                    </Text>
                  </HStack>
                }
                isManageMode={groupStore.isManageMode}
                setIsManageMode={groupStore.setManageMode}
                controlBy="groupPage"
              />
            )}

            {/* -------------GROUP DETAIL------------ */}
            {!!matchPath("/groups/:groupId", location?.pathname) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      color={"primary.700"}
                      onClick={() =>
                        navigate(routes.groups.value, { replace: true })
                      }
                    >
                      Groups
                    </Text>
                    {groupStore?.groupDetail && (
                      <>
                        <ChevronRightIcon />
                        <Text color="gray.700">
                          {groupStore?.groupDetail?.name ?? ""}
                        </Text>
                      </>
                    )}
                  </HStack>
                }
                controlBy="groupMemberList"
                // isManageMode={groupStore.isManageModeInMemberList}
              />
            )}

            {/*-------------DOCUMENT TYPE------------ */}
            {!!matchPath(
              location?.pathname,
              routes.setting.documentType.value
            ) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.setting.documentType.value, {
                          replace: true,
                        })
                      }
                    >
                      Document Types
                    </Text>
                  </HStack>
                }
                hasManageMode={false}
              />
            )}

            {/* ---------------TAG------------------ */}
            {!!matchPath(location?.pathname, routes.setting.tag.value) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.setting.tag.value, {
                          replace: true,
                        })
                      }
                    >
                      Tags
                    </Text>
                  </HStack>
                }
                hasManageMode={false}
              />
            )}

            {/* ---------------NOTIFICATION------------------ */}
            {!!matchPath(location?.pathname, routes.notifications.value) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.setting.tag.value, {
                          replace: true,
                        })
                      }
                    >
                      Notifications
                    </Text>
                  </HStack>
                }
                hasManageMode={false}
              />
            )}

            {/* ----------------DASHBOARD----------------- */}
            {(!!matchPath(location?.pathname, routes.dashboard.value) ||
              !!matchPath(location?.pathname, routes.home.value)) && (
              <HeaderBar
                title={
                  <HStack spacing={1}>
                    <SvgIcon
                      iconName="home"
                      size={24}
                      cursor="pointer"
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    />
                    <ChevronRightIcon />
                    <Text
                      cursor="pointer"
                      fontWeight={500}
                      onClick={() =>
                        navigate(routes.dashboard.value, { replace: true })
                      }
                    >
                      Dashboard
                    </Text>
                  </HStack>
                }
                hasManageMode={false}
              />
            )}
          </Flex>
        </Stack>
      </div>
    </React.Fragment>
  );
};

export default observer(TopBar);
