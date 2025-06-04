/* eslint-disable max-lines */
import { useEffect, useState } from 'react';
import {
  Checkbox,
  FormControl,
  HStack,
  Menu,
  MenuList,
  Stack,
  Tag,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import capitalize from 'lodash/capitalize';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { IDropdown } from 'types/common';
import { IPagination } from 'components/CkTable';
import CkTableV2 from 'components/CkTableV2';
import Dropdown from 'components/Dropdown';
import DropdownButton from 'components/Dropdown/DropdownButton';
import DropdownSelection from 'components/Dropdown/DropdownSelection';
import ExportCsvButton from 'components/ExportCsvButton';
import InfoBox from 'components/InfoBox';
import SearchInput from 'components/SearchInput';
import {
  DATE_INPUT_FORMAT,
  DATE_INPUT_MASK,
  PICKER_DATE_FORMAT,
} from 'constants/common/date';
import { licenseOptions } from 'constants/report/license';
import { EPeriod, periodOptions } from 'constants/report/period';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { ReactComponent as CollectionIcon } from '../../assets/icons/collection-green.svg';
import { ReactComponent as DownloadIcon } from '../../assets/icons/download.svg';
import { ReactComponent as CompanyIcon } from '../../assets/icons/outline-account-tree.svg';
import { ReactComponent as ProcessIcon } from '../../assets/icons/process-dark-blue.svg';
import { ReactComponent as UserIcon } from '../../assets/icons/user-orange.svg';
import {
  getHeaderList,
  getLicenseTagBackground,
  getLicenseTagColor,
} from './utils';
import { ICompanyReportTable } from 'constants/report';
import CustomDateRangePickerWithMask from 'components/CustomDaterRangePickerWithMask';
// import { DatePicker as ChakraDatePicker } from '@orange_digital/chakra-datepicker';

export function getTimeRangeByPeriod(period: EPeriod): {
  startTime?: Date;
  endTime?: Date;
} {
  if (period === EPeriod.CUSTOM) {
    return {};
  }

  if (period === EPeriod.YEAR_TO_DATE) {
    return {
      startTime: dayjs().startOf('year').toDate(),
      endTime: dayjs().toDate(),
    };
  }

  if (period === EPeriod.ALL_TIME) {
    return {
      startTime: dayjs().year(2000).toDate(),
      endTime: dayjs().toDate(),
    };
  }

  const now = dayjs();
  const periodParts = period.split(' ');
  const periodType = periodParts[0];
  const timePeriod = periodParts[1] as dayjs.ManipulateType;

  let startTime = now.startOf(timePeriod);
  let endTime = now.endOf(timePeriod);

  if (periodType === 'last') {
    startTime = startTime.subtract(1, timePeriod);
    endTime = endTime.subtract(1, timePeriod);
  } else if (period === EPeriod.DAY) {
    startTime = startTime.subtract(1, 'day');
  }

  return {
    startTime: startTime.toDate(),
    endTime: endTime.toDate(),
  };
}

const CompanyReportPage = () => {
  const methods = useForm();
  const { handleSubmit, setValue, control } = methods;
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageIndex = Number(params.get('page') || '1');
  const { organizationStore, reportStore, spinnerStore } = useStores();
  const { companyReport, companyReportTable } = reportStore;
  const { organization } = organizationStore;
  const currentTheme = organization?.theme ?? {};
  const [pageSize, setPageSize] = useState<number>(20);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedLicense, setSelectedLicense] = useState<string[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<IDropdown>(
    periodOptions[1]
  );
  const period: string = `${currentPeriod?.value}`;
  const modifiedDate: Date[] = useWatch({ control, name: 'modifiedDate' });

  const pagination: IPagination = {
    gotoPage,
    pageIndex,
    tableLength: companyReportTable?.totalCount?.[0]?.total ?? 0,
  };

  const dataInTable = getValidArray(companyReportTable?.results).map(
    (data: ICompanyReportTable) => {
      function gotoReportDetailPage() {
        const organizationId: number = data?.id ?? 0;
        params.set('period', `${currentPeriod?.value}`);
        navigate(
          `${routes.organizations.value}/${organizationId}?${params.toString()}`
        );
      }

      return {
        ...data,
        name: (
          <Text
            onClick={gotoReportDetailPage}
            _hover={{ color: currentTheme?.primaryColor ?? 'primary.500' }}
          >
            {data?.name}
          </Text>
        ),
        lastLogin: data?.lastSignInAt
          ? dayjs(data?.lastSignInAt).format('DD/MM/YYYY')
          : '',
        license: (
          <Tag
            size="sm"
            color={getLicenseTagColor(data?.license)}
            background={getLicenseTagBackground(data?.license)}
          >
            {capitalize(data?.license)}
          </Tag>
        ),
      };
    }
  );

  function handleSelectLicense(license: string): void {
    const index: number = selectedLicense?.indexOf(license);
    if (index === -1) {
      setSelectedLicense([...selectedLicense, license]);
    } else {
      setSelectedLicense(
        [...selectedLicense].filter((item) => item !== license)
      );
    }
  }

  function gotoPage(newPage: number): void {
    params.set('page', `${newPage}`);
    navigate(`${routes.dashboard.value}?${params.toString()}`);
  }

  async function onSubmit(): Promise<void> {
    const [startTime, endTime] = modifiedDate;
    if (startTime && endTime) {
      spinnerStore.showLoading();
      await Promise.all([
        reportStore.fetchCompanyReport({
          licenses: selectedLicense,
          startDate: startTime,
          endDate: endTime,
        }),
        reportStore.fetchCompanyReportTable({
          name: searchKeyword,
          licenses: selectedLicense,
          skip: (pageIndex - 1) * pageSize,
          limit: pageSize,
          startDate: startTime,
          endDate: endTime,
        }),
      ]);
      spinnerStore.hideLoading();
    }
  }

  useEffect(() => {
    const { startTime, endTime } = getTimeRangeByPeriod(
      currentPeriod?.value as EPeriod
    );
    setValue('modifiedDate', [startTime, endTime]);
    setIsDisabled(currentPeriod.value !== EPeriod.CUSTOM);
  }, [currentPeriod.value]);

  useEffect(() => {
    if (modifiedDate && pageIndex === 1) {
      onSubmit();
    } else {
      gotoPage(1);
    }
  }, [selectedLicense, modifiedDate]);

  useEffect(() => {
    if (modifiedDate) {
      onSubmit();
    }
  }, [pageIndex, pageSize, searchKeyword]);

  const debounceSearch = debounce((searchText: string) => {
    setSearchKeyword(searchText);
  }, 500);

  return (
    <FormProvider {...methods}>
      <chakra.form onSubmit={handleSubmit(onSubmit)} width="full">
        <VStack spacing={4}>
          <Stack
            width={{ base: 'full', lg: 'auto' }}
            background="white"
            paddingX={6}
            paddingY={4}
            borderRadius={8}
            justifyContent="space-between"
            flexDirection={{ base: 'column', lg: 'row' }}
            spacing={0}
            gap={4}
            alignSelf="flex-start"
          >
            <Menu
              closeOnSelect={true}
              autoSelect={false}
              computePositionOnMount
            >
              {({ isOpen }) => (
                <>
                  <DropdownButton
                    width={{ base: 'full', lg: 'auto' }}
                    isOpen={isOpen}
                    placeHolder="License"
                  />
                  <MenuList zIndex="1001" border="1px solid #E2E8F0">
                    {getValidArray(licenseOptions).map(
                      (option: IDropdown, index: number) => (
                        <DropdownSelection
                          key={index}
                          width="full"
                          label={option?.title}
                          onClick={() =>
                            handleSelectLicense(`${option?.value}`)
                          }
                        >
                          <HStack align="center" width="full">
                            <Checkbox
                              size="md"
                              margin={0}
                              isChecked={selectedLicense.includes(
                                `${option?.value}`
                              )}
                            />
                            <Text
                              color="gray.700"
                              fontSize="md"
                              fontWeight={500}
                              lineHeight={6}
                              width="full"
                            >
                              {option?.title}
                            </Text>
                          </HStack>
                        </DropdownSelection>
                      )
                    )}
                  </MenuList>
                </>
              )}
            </Menu>
            <Dropdown
              options={periodOptions}
              name="period"
              width={{ base: 'full', lg: 'auto' }}
              item={currentPeriod}
              setValue={(name: string, value: IDropdown) => {
                setCurrentPeriod(value);
              }}
            />
            <VStack alignItems="flex-start">
              <FormControl>
                <Controller
                  name="modifiedDate"
                  control={control}
                  render={datePickerProps => {
                    return (
                      <CustomDateRangePickerWithMask
                        name="modifiedDate"
                        dateFormat={PICKER_DATE_FORMAT}
                        inputFormat={DATE_INPUT_FORMAT}
                        inputMask={DATE_INPUT_MASK}
                        inputPlaceholder="__/__/____ - __/__/____"
                        setValue={setValue}
                        isDisabled={isDisabled}
                        {...datePickerProps}
                      />
                    )
                  }}
                />
              </FormControl>
            </VStack>
          </Stack>
          <Stack
            flexDirection={{ base: 'column', lg: 'row' }}
            spacing={0}
            gap={4}
            width="full"
          >
            <InfoBox
              period={period}
              icon={<CompanyIcon />}
              title="Total Company/Organization"
              value={companyReport?.totalCompany?.total ?? 0}
              percent={companyReport?.totalCompany?.percentChange ?? 0}
            />
            <InfoBox
              period={period}
              icon={<ProcessIcon />}
              title="Total Processes"
              value={companyReport?.totalProcess?.total ?? 0}
              percent={companyReport?.totalProcess?.percentChange}
            />
            <InfoBox
              period={period}
              icon={<CollectionIcon />}
              title="Total Collections"
              value={companyReport?.totalCollection?.total ?? 0}
              percent={companyReport?.totalCollection?.percentChange ?? 0}
            />
            <InfoBox
              period={period}
              icon={<UserIcon />}
              title="Total Users"
              value={companyReport?.totalUser?.total ?? 0}
              percent={companyReport?.totalUser?.percentChange ?? 0}
            />
          </Stack>
          <VStack width="full" spacing={0}>
            <HStack
              width="full"
              background="white"
              justifyContent="space-between"
              paddingX={6}
              paddingY={3}
              borderTopRadius={16}
              borderBottom="1px solid #E2E8F0"
            >
              <Text
                display={{ base: 'none', sm: 'block' }}
                fontSize="md"
                color="gray.700"
                fontWeight={600}
                lineHeight={6}
              >
                Company Overview
              </Text>
              <HStack spacing={4}>
                <SearchInput
                  width={250}
                  placeholder="Search by name..."
                  onChange={(event) => debounceSearch(event.target.value)}
                />
                <ExportCsvButton
                  filename="Company-Overview.csv"
                  iconChildren={<DownloadIcon width={16} />}
                  data={getValidArray(companyReportTable?.results)}
                />
              </HStack>
            </HStack>
            <CkTableV2
              headerList={getHeaderList()}
              tableData={dataInTable}
              pagination={pagination}
              pageSize={pageSize}
              setPageSize={setPageSize}
              spacingX={4}
              hasNoSort
            />
          </VStack>
        </VStack>
      </chakra.form>
    </FormProvider>
  );
};

export default observer(CompanyReportPage);
