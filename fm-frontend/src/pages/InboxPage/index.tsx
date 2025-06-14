import { Button, HStack, VStack } from '@chakra-ui/react';
import { AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import trim from 'lodash/trim';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { primary700 } from 'themes/globalStyles';
import SupportInboxPage from '../SupportInboxPage';
import { EInboxTab, getSortByOptions } from '../SupportInboxPage/constants';
import GeneralInbox from './GeneralInbox';

const InboxContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const generalKeyword = trim(params.get('generalKeyword') || '');
  const persistedTab: string = `${
    params.get('tab') || EInboxTab.SUPPORT
  }` as EInboxTab;
  const generalLimit: number = Number(params.get('generalLimit')) || 20;
  const { authStore, messageStore, organizationStore, userStore, groupStore } = useStores();
  const { userDetail } = authStore;
  const { organization } = organizationStore;
  const { unreadSupportThreadCount, unreadGeneralThreadCount } = messageStore;
  const currentTheme = organization?.theme ?? {};
  const isMessageFullAccess = userDetail?.isMessageFullAccess;
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const sortByOptions = getSortByOptions(isBasicUser && !isMessageFullAccess);

  function toggleTab(tab: EInboxTab): void {
    params.set('tab', `${tab}`);
    navigate({ search: params.toString() });
  }

  useEffect(() => {
    if (userDetail?.id) {
      if (isBasicUser && !isMessageFullAccess) {
        messageStore.changeSortBy(`${sortByOptions[0]?.value}`);
      } 
    }
  }, [userDetail?.id]);

  useEffect(() => {
  }, [generalKeyword, generalLimit]);

  useEffect(() => {
    userStore.getUsers({ where: { organizationId: organization?.id } });
    groupStore.getGroups({
      where: {
        organizationId: organization?.id,
      },
      fields: ['id', 'name'],
      include: ['groupMembers'],
    });
  }, []);

  return (
    <VStack
      position="relative"
      width="full"
      height="calc(100vh - 110px)"
      spacing={0}
    >
      <HStack
        spacing={0}
        width="full"
        paddingBottom={0}
        borderTopRadius={8}
        color="gray.600"
        fontSize="md"
      >
        <Button
          paddingX={2}
          paddingY={4}
          border="none"
          borderRadius={0}
          background={'transparent'}
          borderBottom={
            persistedTab === EInboxTab.SUPPORT
              ? `2px solid ${currentTheme.primaryColor ?? primary700}`
              : 'none'
          }
          color={
            persistedTab === EInboxTab.SUPPORT
              ? currentTheme.primaryColor ?? primary700
              : 'gray.600'
          }
          fontWeight={persistedTab === EInboxTab.SUPPORT ? 600 : 400}
          _hover={{ background: 'transparent' }}
          _active={{ background: 'transparent' }}
          onClick={() => toggleTab(EInboxTab.SUPPORT)}
        >
          {`Threads ${
            unreadSupportThreadCount > 0 ? `(${unreadSupportThreadCount})` : ''
          }`}
        </Button>
        <Button
          paddingX={2}
          paddingY={4}
          border="none"
          borderRadius={0}
          background={'transparent'}
          borderBottom={
            persistedTab === EInboxTab.GENERAL
              ? `2px solid  ${currentTheme.primaryColor ?? primary700}`
              : 'none'
          }
          color={
            persistedTab === EInboxTab.GENERAL
              ? currentTheme.primaryColor ?? primary700
              : 'gray.600'
          }
          fontWeight={persistedTab === EInboxTab.GENERAL ? 600 : 400}
          _hover={{ background: 'transparent' }}
          _active={{ background: 'transparent' }}
          onClick={() => toggleTab(EInboxTab.GENERAL)}
        >
          {`Messages ${
            unreadGeneralThreadCount > 0 ? `(${unreadGeneralThreadCount})` : ''
          }`}
        </Button>
      </HStack>
      {persistedTab === EInboxTab.GENERAL && <GeneralInbox />}
      {persistedTab === EInboxTab.SUPPORT && <SupportInboxPage />}
    </VStack>
  );
};

export default observer(InboxContainer);
