import { Search2Icon } from '@chakra-ui/icons';
import {
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react';
import SvgIcon from 'components/SvgIcon';
import { EBreakPoint } from 'constants/theme';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import NewGeneralMessageModal from '../NewGeneralModal';

const GeneralHeader = () => {
  const { organizationStore, authStore } = useStores();
  const { userDetail } = authStore;
  const { organization } = organizationStore;
  const currentTheme = organization?.theme ?? {};
  const {
    isOpen: isOpenNewGeneralMessageModal,
    onOpen: onOpenNewGeneralMessageModal,
    onClose: onCloseNewGeneralMessageModal,
  } = useDisclosure();
  const debounceSearch = debounce(handleSearch, 500);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const limit: number = Number(params.get('limit')) || 20;
  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

  function handleSearch(keyword: string): void {
    // messageStore.fetchGeneralMessageThreads(limit, keyword);
    params.set('generalKeyword', keyword);
    navigate(`${routes.messages.value}?${params.toString()}`);
  }

  useEffect(() => {
    params.set('generalKeyword', '');
    navigate(`${routes.messages.value}?${params.toString()}`);
  }, []);

  return (
    <HStack
      width="full"
      height="64px"
      justify="space-between"
      paddingY={4}
      borderTop="2px solid #E2E8F0"
    >
      <InputGroup size="sm" borderRadius="6" background="white" width="auto">
        <InputLeftElement pointerEvents="none" borderRadius="6">
          <Search2Icon color="gray.400" />
        </InputLeftElement>
        <Input
          width="300px"
          height="32px"
          type="search"
          borderRadius="6"
          placeholder="Search by username"
          onChange={(event) => debounceSearch(event.currentTarget.value)}
        />
      </InputGroup>
      {!isTablet && (
        <Button
          size="sm"
          border="none"
          borderRadius="6"
          variant="outline"
          paddingX={3}
          color="white"
          fontWeight={500}
          background={currentTheme?.primaryColor ?? 'primary.500'}
          _hover={{
            background: currentTheme?.primaryColor ?? 'primary.700',
            opacity: currentTheme?.primaryColor ? 0.8 : 1,
          }}
          _active={{
            background: currentTheme?.primaryColor ?? 'primary.700',
            opacity: currentTheme?.primaryColor ? 0.8 : 1,
          }}
          leftIcon={<SvgIcon iconName="ic_outline-add" size={16} />}
          onClick={onOpenNewGeneralMessageModal}
        >
          New Message
        </Button>
      )}
      {isTablet && (
        <IconButton
          size="sm"
          border="none"
          borderRadius="6"
          variant="outline"
          aria-label="Add comment"
          _hover={{ opacity: 0.8 }}
          icon={<SvgIcon iconName="ic_outline-add" size={16} />}
          background={currentTheme?.primaryColor ?? 'primary.500'}
          onClick={onOpenNewGeneralMessageModal}
          position={isTablet ? 'absolute' : 'static'}
          right={0}
          top={isTablet ? '20px' : '0'}
        />
      )}
      <NewGeneralMessageModal
        isOpen={isOpenNewGeneralMessageModal}
        onClose={onCloseNewGeneralMessageModal}
      />
    </HStack>
  );
};

export default GeneralHeader;
