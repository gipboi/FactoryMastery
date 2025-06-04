import {
  Box,
  HStack,
  Switch,
  Tag,
  Text,
  useDisclosure,
  VStack,
  Stack,
  Flex,
} from '@chakra-ui/react';
import Avatar from 'components/Avatar';
// import GeneralMessageModal from "components/GeneralMessageModal";
import SvgIcon from 'components/SvgIcon';
import { AuthRoleNameEnum } from 'constants/user';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import { IGroup } from 'interfaces/groups';
import { IUserWithRelations } from 'interfaces/user';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import CustomButton from 'pages/UserPage/components/CustomButton';
import UserTypeTag from 'pages/UserPage/components/UserList/components/UserTypeTag';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getName } from 'utils/user';
import { filterUserDetail } from './utils';
import { IFilter } from 'types/common';
import NewGeneralMessageModal from 'pages/InboxPage/GeneralInbox/components/NewGeneralModal';
import useBreakPoint from 'hooks/useBreakPoint';
import { EBreakPoint } from 'constants/theme';

const UserDetailPage = () => {
  const { userStore, authStore, organizationStore } = useStores();
  const { userDetail, currentUser } = userStore;
  const { organization } = organizationStore;
  const currentUserRole: string = currentUser?.authRole ?? '';
  const organizationId: string = organization?.id ?? '';
  const params = useParams();
  const userId = String(get(params, 'userId', ''));
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

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
    ? (userDetail?.organizationId ?? '', userDetail.image)
    : '';

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
      userStore.getUserDetail(
        userId ?? '',
        filterUserDetail as IFilter<IUserWithRelations>
      );
    }
  }, [userId]);

  const DetailField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack 
      direction={{ base: 'column', md: 'row' }} 
      alignItems={{ base: 'flex-start', md: 'flex-start' }}
      spacing={{ base: 1, md: 4 }}
      width="full"
    >
      <Text
        fontSize="14px"
        color="gray.700"
        fontWeight="600"
        lineHeight="20px"
        width={{ base: 'full', md: '168px' }}
        marginBottom={0}
        flexShrink={0}
      >
        {label}
      </Text>
      <Box flex={1}>
        {children}
      </Box>
    </Stack>
  );

  const PermissionField = ({ label, isChecked }: { label: string; isChecked: boolean }) => (
    <Stack 
      direction={{ base: 'column', md: 'row' }} 
      alignItems={{ base: 'flex-start', md: 'flex-start' }}
      spacing={{ base: 1, md: 4 }}
      width="full"
    >
      <Text
        width={{ base: 'full', md: '168px' }}
        color="gray.700"
        fontSize="14px"
        fontWeight="600"
        lineHeight="20px"
        flexShrink={0}
      >
        {label}
      </Text>
      <HStack>
        <Switch
          margin={0}
          isChecked={isChecked}
          isDisabled
          colorScheme="primary"
          size={{ base: "sm", md: "md" }}
        />
        <Text
          color="gray.700"
          fontSize="16px"
          fontWeight="400"
          lineHeight="24px"
        >
          {isChecked ? 'On' : 'Off'}
        </Text>
      </HStack>
    </Stack>
  );

  return (
    <VStack 
      width="full" 
      height="full" 
      spacing={{ base: 4, md: 6 }}
      px={{ base: 4, md: 0 }}
      py={{ base: 4, md: 0 }}
    >
      {!isHideSendMessage && (
        <Flex justifyContent="flex-end" width="full">
          {organization?.isReportTool && (
            <CustomButton
              content="Send message"
              fontSize={{ base: "14px", md: "16px" }}
              className="outline"
              color="gray.700"
              height={{ base: "36px", md: "40px" }}
              margin={0}
              leftIcon={<SvgIcon iconName="outline-message" size={16} />}
              onClick={openMessageModal}
              background="white"
              px={{ base: 3, md: 4 }}
            />
          )}
        </Flex>
      )}

      <Stack 
        direction={{ base: 'column', lg: 'row' }} 
        spacing={{ base: 4, md: 6 }} 
        width="full" 
        alignItems={{ base: 'stretch', lg: 'flex-start' }}
      >
        {/* Main Content */}
        <VStack width="full" spacing={{ base: 4, md: 6 }} flex={1}>
          {/* Detail Section */}
          <VStack
            width="full"
            background="white"
            borderRadius="8px"
            alignItems="flex-start"
            padding={{ base: 3, md: 4 }}
            spacing={{ base: 3, md: 4 }}
          >
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={{ base: 2, sm: 4 }}
              minWidth="max-content"
              justifyContent="space-between"
              width="100%"
              alignItems={{ base: 'flex-start', sm: 'center' }}
            >
              <Text
                fontSize={{ base: "16px", md: "18px" }}
                color="gray.800"
                fontWeight="600"
                lineHeight="28px"
                marginBottom={0}
              >
                Detail
              </Text>
              <Box>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={{ base: 0, sm: 2 }}>
                  <Text
                    margin={0}
                    fontSize={{ base: "12px", md: "14px" }}
                    color="gray.500"
                    fontWeight="600"
                    lineHeight="20px"
                  >
                    Last Updated
                  </Text>
                  <Text
                    margin={0}
                    fontSize={{ base: "12px", md: "14px" }}
                    color="gray.500"
                    fontWeight="400"
                    lineHeight="20px"
                  >
                    {dayjs(userDetail?.updatedAt).format('MMM D, YYYY')}
                  </Text>
                </Stack>
              </Box>
            </Stack>
            
            <VStack alignItems="flex-start" spacing={{ base: 3, md: 4 }} width="full">
              <DetailField label="User Name">
                <Text fontSize={{ base: "14px", md: "16px" }}>{userDetail?.username ?? ''}</Text>
              </DetailField>
              
              <DetailField label="User Type">
                <HStack flexWrap="wrap">
                  <UserTypeTag
                    role={getUserRole(userDetail)}
                    disabled={userDetail?.disabled}
                  />
                </HStack>
              </DetailField>
              
              <DetailField label="Full Name">
                <Text fontSize={{ base: "14px", md: "16px" }}>{getName(userDetail)}</Text>
              </DetailField>
              
              <DetailField label="Email Address">
                <Text 
                  fontSize={{ base: "14px", md: "16px" }}
                  wordBreak="break-word"
                >
                  {userDetail?.email ?? ''}
                </Text>
              </DetailField>
              
              <DetailField label="Groups">
                <Flex gap={2} flexWrap="wrap">
                  {userDetail?.groupMembers?.map((groupMember) => (
                    <Tag
                      key={(groupMember?.group as IGroup[])?.[0]?.id}
                      variant="solid"
                      background="gray.50"
                      border="1px solid #E2E8F0"
                      borderRadius="6px"
                      fontSize={{ base: "12px", md: "14px" }}
                      color="gray.700"
                      h={{ base: "20px", md: "24px" }}
                      whiteSpace="nowrap"
                      px={2}
                    >
                      {(groupMember?.group as IGroup[])?.[0]?.name}
                    </Tag>
                  ))}
                </Flex>
              </DetailField>
            </VStack>
          </VStack>

          {/* Permission Section */}
          <VStack
            width="full"
            background="white"
            borderRadius="8px"
            alignItems="flex-start"
            padding={{ base: 3, md: 4 }}
            spacing={{ base: 3, md: 4 }}
          >
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={{ base: 2, sm: 4 }}
              minWidth="max-content"
              justifyContent="space-between"
              width="100%"
              alignItems={{ base: 'flex-start', sm: 'center' }}
            >
              <Text
                fontSize={{ base: "16px", md: "18px" }}
                color="gray.800"
                fontWeight="600"
                lineHeight="28px"
                marginBottom={0}
              >
                Permission
              </Text>
              <Box>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={{ base: 0, sm: 2 }}>
                  <Text
                    margin={0}
                    fontSize={{ base: "12px", md: "14px" }}
                    color="gray.500"
                    fontWeight="600"
                    lineHeight="20px"
                  >
                    Last Updated
                  </Text>
                  <Text
                    margin={0}
                    fontSize={{ base: "12px", md: "14px" }}
                    color="gray.500"
                    fontWeight="400"
                    lineHeight="20px"
                  >
                    {dayjs(
                      userDetail?.permissionUpdatedAt ?? userDetail?.updatedAt
                    ).format('MMM D, YYYY')}
                  </Text>
                </Stack>
              </Box>
            </Stack>
            
            <VStack alignItems="flex-start" spacing={{ base: 3, md: 4 }} width="full">
              <PermissionField 
                label="Report tool" 
                isChecked={userDetail?.isReportTool ?? false} 
              />
              <PermissionField 
                label="Message full access" 
                isChecked={userDetail?.isMessageFullAccess ?? false} 
              />
            </VStack>
          </VStack>
        </VStack>

        {/* Profile Picture Section */}
        <VStack
          backgroundColor="#FFFFFF"
          borderRadius="8px"
          padding={{ base: 3, md: 4 }}
          spacing={{ base: 3, md: 4 }}
          minWidth={{ base: 'full', lg: '313px' }}
          maxWidth={{ base: 'full', lg: '313px' }}
          alignSelf={{ base: 'stretch', lg: 'flex-start' }}
        >
          <Text
            alignSelf="flex-start"
            fontSize={{ base: "16px", md: "18px" }}
            color="gray.800"
            fontWeight="600"
            lineHeight="28px"
            marginBottom={0}
          >
            Profile Picture
          </Text>
          <Box alignSelf={{ base: 'center', lg: 'center' }}>
            <Avatar
              isLarge
              src={imageUrl ?? ''}
              name={userDetail?.fullName ?? ''}
            />
          </Box>
        </VStack>
      </Stack>
      
      <NewGeneralMessageModal
        isOpen={isOpenMessageModal}
        onClose={closeMessageModal}
        recipient={userDetail as IUserWithRelations}
      />
    </VStack>
  );
};

export default observer(UserDetailPage);