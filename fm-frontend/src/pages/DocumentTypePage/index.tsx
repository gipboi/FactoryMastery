import { AddIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { handleError } from 'API';
import CkTable, { IPagination } from 'components/CkTable';
import { documentTypeIcon } from 'components/Icon';
import { DATE_FORMAT } from 'constants/common/date';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import { IDocumentType } from 'interfaces/documentType';
import { ITheme } from 'interfaces/theme';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import { primary } from 'themes/globalStyles';
import { getValidArray } from 'utils/common';
import { getFullName } from 'utils/user';
import { ReactComponent as EditButton } from '../../assets/icons/edit-button.svg';
import DetailModal from './components/DetailModal';
import { getDocumentTypeByAggregation, getHeaderList } from './utils';

const DocumentTypePage = () => {
  const { documentTypeStore, spinnerStore, authStore, organizationStore } =
    useStores();
  const { userDetail } = authStore;
  const { documentTypes, documentTypesLength: tableLength } = documentTypeStore;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageIndex: number = Number(query.get('page')) || 1;
  const [keyword, setKeyword] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [sort, setSort] = useState<string>('createdAt');
  const [orderBy, setOrderBy] = useState<number>(-1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const changeName = useCallback(
    debounce((event: { target: { value: string } }) => {
      setKeyword(event?.target?.value ?? '');
      gotoPage(0);
    }, 1000),
    []
  );
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  function gotoPage(newPage: number) {
    query.set('page', `${newPage}`);
    navigate(`${routes.setting.documentType.value}?${query.toString()}`);
  }

  function reloadData(): void {
    setKeyword('');
    gotoPage(0);
    fetchData();
  }

  async function fetchData(
    isReset: boolean = false,
    page: number = pageIndex
  ): Promise<void> {
    try {
      spinnerStore.showLoading();
      const sortOrder = { [sort]: orderBy };

      const pipeline = getDocumentTypeByAggregation(
        userDetail?.organizationId ?? '',
        pageSize,
        isReset ? 0 : pageSize * (page - 1),
        keyword,
        false,
        sortOrder
      );
      const countPipeline = getDocumentTypeByAggregation(
        userDetail?.organizationId ?? '',
        0,
        0,
        keyword,
        true,
        sortOrder
      );

      await documentTypeStore.fetchCMSDocumentTypeList(pipeline, countPipeline);
      spinnerStore.hideLoading();
    } catch (error: any) {
      handleError(
        error as Error,
        'components/pages/DocumentTypePage/index.tsx',
        'fetchData'
      );
    }
  }

  useEffect(() => {
    if (!isOpen && userDetail?.organizationId) {
      fetchData();
    }
  }, [
    keyword,
    pageSize,
    pageIndex,
    userDetail?.organizationId,
    isOpen,
    sort,
    orderBy,
  ]);

  const pagination: IPagination = { pageIndex, tableLength, gotoPage };

  const dataInTable = getValidArray<IDocumentType>(documentTypes).map(
    (documentType) => {
      function handleEdit(): void {
        documentTypeStore.selectDocumentType(documentType?.id ?? '');
        onOpen();
      }
      const { firstName, lastName } = documentType?.creator ?? {};
      const creatorName = getFullName(firstName, lastName);
      return {
        ...documentType,
        icon: (
          <Box w={12}>
            <IconBuilder
              icon={documentType?.icon ?? documentTypeIcon}
              size={40}
              isActive
            />
          </Box>
        ),
        name: documentType?.name ?? 'N/A',
        createdBy: creatorName.trim() || 'N/A',
        createdAt: dayjs(documentType?.createdAt).format(DATE_FORMAT),
        actions: (
          <IconButton
            border="unset"
            boxShadow="unset"
            background="#F7FAFC"
            variant="ghost"
            colorScheme="#F7FAFC"
            aria-label="Call Segun"
            _hover={{ background: 'gray.100' }}
            onClick={handleEdit}
            icon={<EditButton />}
          />
          // <HStack spacing={2}>
          //   {/*
          //   // TODO: Integrate later
          //   <IconButton
          //     border="unset"
          //     boxShadow="unset"
          //     background="#F7FAFC"
          //     variant="ghost"
          //     colorScheme="#F7FAFC"
          //     aria-label="Call Segun"
          //     _hover={{ background: '#edf2f7' }}
          //     icon={<MoreButton />}
          //   /> */}
          // </HStack>
        ),
      };
    }
  );

  return (
    <VStack spacing={6} height="full" padding={{ base: 0, md: 6 }}>
      <HStack spacing={2} width="full">
        <Box
          display={{ base: 'flex', md: 'none' }}
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            paddingY={2}
            paddingX={2}
            outline="unset"
            border="unset"
            color="white"
            background={currentTheme?.primaryColor ?? 'primary.500'}
            _hover={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _focus={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            onClick={onOpen}
            borderRadius="8px"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
          >
            Create
          </Button>
        </Box>
      </HStack>
      <Stack
        flexDirection={{ base: 'column', md: 'row' }}
        width="full"
        spacing={0}
        justifyContent="space-between"
        marginTop="-24px"
      >
        <InputGroup borderRadius="6px" background="white" width="auto">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            type="search"
            placeholder="Search type by name"
            onChange={changeName}
            width={{ base: '100%', md: '420px' }}
            _focus={{ borderColor: currentTheme?.primaryColor ?? primary }}
          />
        </InputGroup>
        <Box
          display={{ base: 'none', md: 'flex' }}
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            paddingY={2}
            paddingX={4}
            outline="unset"
            border="unset"
            color="white"
            gap={{ base: 0, md: 2 }}
            background={currentTheme?.primaryColor ?? 'primary.500'}
            _hover={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            onClick={onOpen}
            borderRadius="8px"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
          >
            <Flex height={6} alignItems="center">
              <AddIcon fontSize="12px" />
            </Flex>
            Create Type
          </Button>
        </Box>
      </Stack>
      <Divider borderColor="gray.200" margin={0} />
      <Box width="full" paddingBottom={6}>
        <CkTable
          headerList={getHeaderList()}
          tableData={dataInTable}
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
          isManualSort
          setSort={setSort}
          setOrderBy={setOrderBy}
        />
      </Box>
      <DetailModal isOpen={isOpen} onClose={onClose} reloadData={reloadData} />
    </VStack>
  );
};

export default observer(DocumentTypePage);
