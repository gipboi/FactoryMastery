import {
  Box,
  HStack,
  Switch,
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Avatar from "components/Avatar";
// import GeneralMessageModal from "components/GeneralMessageModal";
import SvgIcon from "components/SvgIcon";
import { AuthRoleNameEnum } from "constants/user";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { IGroup } from "interfaces/groups";
import { IUserWithRelations } from "interfaces/user";
import get from "lodash/get";
import { observer } from "mobx-react";
import CustomButton from "pages/UserPage/components/CustomButton";
import UserTypeTag from "pages/UserPage/components/UserList/components/UserTypeTag";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getName } from "utils/user";
import { filterUserDetail } from "./utils";
import { IFilter } from "types/common";

const UserDetailPage = () => {
  const { userStore, groupStore, organizationStore } = useStores();
  const { userDetail, currentUser } = userStore;
  const currentUserRole: string = currentUser?.authRole ?? "";
  const organizationId: string = organizationStore?.organization?.id ?? "";
  const params = useParams();
  const userId = String(get(params, "userId", ""));

  const {
    isOpen: isOpenMessageModal,
    onOpen: openMessageModal,
    onClose: closeMessageModal,
  } = useDisclosure();

  const isHideSendMessage: boolean =
    (currentUserRole === AuthRoleNameEnum.BASIC_USER &&
      userDetail?.authRole === AuthRoleNameEnum.BASIC_USER) ||
    currentUser?.id === userDetail?.id;

  const imageUrl = userDetail?.image
    ? (userDetail?.organizationId ?? "", userDetail.image)
    : "";

  function getUserRole(user: IUserWithRelations): AuthRoleNameEnum {
    let role = AuthRoleNameEnum.BASIC_USER;
    if (user?.authRole === AuthRoleNameEnum.ORG_ADMIN) {
      role = AuthRoleNameEnum.ORG_ADMIN;
    } else if (user?.authRole === AuthRoleNameEnum.MANAGER) {
      role = AuthRoleNameEnum.MANAGER;
    }
    return role;
  }

  useEffect(() => {
    if (userId) {
      userStore.getUserDetail(userId ?? "", filterUserDetail as IFilter<IUserWithRelations>);
    }
  }, [userId]);

  return (
    <VStack width="full" height="full" spacing="6">
      {!isHideSendMessage && (
        <HStack justifyContent="flex-end" width="full">
          <CustomButton
            content="Send message"
            fontSize="16px"
            className="outline"
            color="gray.700"
            height="40px"
            margin={0}
            leftIcon={<SvgIcon iconName="outline-message" size={16} />}
            onClick={openMessageModal}
            background="white"
            disabled
          />
        </HStack>
      )}

      <HStack spacing={6} width="full" alignItems="flex-start">
        <VStack width="full" margin-top="16px" spacing={6}>
          <VStack
            width="full"
            background="white"
            borderRadius="8px"
            alignItems="flex-start"
            padding={4}
            spacing={4}
          >
            <HStack
              spacing={4}
              minWidth="max-content"
              justifyContent="space-between"
              width="100%"
            >
              <HStack spacing={2} alignItems="center" alignSelf="flex-start">
                <Text
                  fontSize="18px"
                  color="gray.800"
                  fontWeight="600"
                  lineHeight="28px"
                  marginBottom={0}
                >
                  Detail
                </Text>
              </HStack>
              <Box>
                <HStack>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="600"
                    lineHeight="20px"
                  >
                    Last Updated
                  </Text>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="400"
                    lineHeight="20px"
                  >
                    {dayjs(userDetail?.updatedAt).format("MMM D, YYYY")}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <VStack alignItems="flex-start" spacing={4}>
              <HStack alignItems="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  width="168px"
                  marginBottom={0}
                >
                  User Name
                </Text>
                <Text>{userDetail?.username ?? ""}</Text>
              </HStack>
              <HStack>
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  width="168px"
                  marginBottom={0}
                >
                  User Type
                </Text>
                <UserTypeTag
                  role={getUserRole(userDetail)}
                  disabled={userDetail?.disabled}
                />
                ,
              </HStack>
              <HStack alignItems="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  width="168px"
                  marginBottom={0}
                >
                  Full Name
                </Text>
                <Text>{getName(userDetail)}</Text>
              </HStack>
              <HStack alignItems="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  width="168px"
                  marginBottom={0}
                >
                  Email Address
                </Text>
                <Text>{userDetail?.email ?? ""}</Text>
              </HStack>
              <HStack alignItems="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  width="168px"
                  marginBottom={0}
                >
                  Groups
                </Text>
                <HStack spacing={0} gap={2} flexWrap="wrap">
                  {userDetail?.groupMembers?.map((groupMember) => (
                    <Tag
                      key={(groupMember?.group as IGroup[])?.[0]?.id}
                      variant="solid"
                      background="gray.50"
                      border="1px solid #E2E8F0"
                      borderRadius="6px"
                      fontSize="14px"
                      color="gray.700"
                      h="24px"
                      whiteSpace="nowrap"
                    >
                      {(groupMember?.group as IGroup[])?.[0]?.name}
                    </Tag>
                  ))}
                </HStack>
              </HStack>
            </VStack>
          </VStack>
          <VStack
            width="full"
            background="white"
            borderRadius="8px"
            alignItems="flex-start"
            padding={4}
            spacing={4}
          >
            <HStack
              spacing={4}
              minWidth="max-content"
              justifyContent="space-between"
              width="100%"
            >
              <HStack spacing={2} alignItems="center" alignSelf="flex-start">
                <Text
                  fontSize="18px"
                  color="gray.800"
                  fontWeight="600"
                  lineHeight="28px"
                  marginBottom={0}
                >
                  Permission
                </Text>
              </HStack>
              <Box>
                <HStack>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="600"
                    lineHeight="20px"
                  >
                    Last Updated
                  </Text>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="400"
                    lineHeight="20px"
                  >
                    {dayjs(
                      userDetail?.permissionUpdatedAt ?? userDetail?.updatedAt
                    ).format("MMM D, YYYY")}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <HStack alignItems="flex-start">
              <Text
                width="168px"
                color="gray.700"
                fontSize="14px"
                fontWeight="600"
                lineHeight="20px"
              >
                Report tool
              </Text>
              <HStack>
                <Switch
                  margin={0}
                  isChecked={userDetail?.isReportTool}
                  isDisabled
                />
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                >
                  {userDetail?.isReportTool ? "On" : "Off"}
                </Text>
              </HStack>
            </HStack>
            <HStack alignItems="flex-start">
              <Text
                width="168px"
                color="gray.700"
                fontSize="14px"
                fontWeight="600"
                lineHeight="20px"
              >
                Message full access
              </Text>
              <HStack>
                <Switch
                  margin={0}
                  isChecked={userDetail?.isMessageFullAccess}
                  isDisabled
                />
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                >
                  {userDetail?.isMessageFullAccess ? "On" : "Off"}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
        <VStack
          backgroundColor=" #FFFFFF"
          margin-top="16px"
          borderRadius="8px"
          padding={4}
          spacing={4}
          minWidth="313px"
        >
          <Text
            alignSelf="flex-start"
            fontSize="18px"
            color="gray.800"
            fontWeight="600"
            lineHeight="28px"
            marginBottom={0}
          >
            Profile Picture
          </Text>
          <Avatar
            isLarge
            src={imageUrl ?? ""}
            name={userDetail?.fullName ?? ""}
          />
        </VStack>
      </HStack>
      {/* <GeneralMessageModal
        isOpen={isOpenMessageModal}
        toggle={isOpenMessageModal ? closeMessageModal : openMessageModal}
        recipient={userDetail as IUserWithRelations}
      /> */}
    </VStack>
  );
};

export default observer(UserDetailPage);
