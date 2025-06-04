import { useEffect, useState } from 'react';
import {
  Button,
  HStack,
  Img,
  Input,
  Stack,
  Tag,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react';
import MissingImage from 'assets/images/missing_image.png';
import { useStores } from 'hooks/useStores';
import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IDropdown } from 'types/common';
import { updateAdminOrganizationById } from 'API/report';
import ConfirmModal from 'components/Chakra/ConfirmModal';
import Dropdown from 'components/Dropdown';
import SvgIcon from 'components/SvgIcon';
import { ELicenseType, licenseOptions } from 'constants/report/license';
import { EPeriod } from 'constants/report/period';
import { ITheme } from 'interfaces/theme';
import {
  getLicenseTagBackground,
  getLicenseTagColor,
} from 'pages/CompanyReportPage/utils';
import FormSwitch from './components/FormSwitch';
import FormView from './components/FormView';
import { ICompanyReportForm } from './constants';
import { getCompanyReportFormData } from './utils';
import { getTimeRangeByPeriod } from 'pages/CompanyReportPage';
import { SUPER_ADMIN_PASSWORD } from 'constants/admin';

const CompanyDetailPage = () => {
  const { organizationStore, reportStore } = useStores();
  const { organization } = organizationStore;
  const { companyReportDetail } = reportStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const params = useParams();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const period = search.get('period') ?? '';
  const organizationId = get(params, 'organizationId', '');
  const methods = useForm();
  const { getValues, handleSubmit, register, reset, setValue } = methods;
  const [isOpenComfirmModal, setIsOpenComfirmModal] = useState<boolean>(false);
  const [currentPeriod, setCurrentPeriod] = useState<IDropdown>(
    licenseOptions[0]
  );

  async function onSubmit(): Promise<void> {
    const password: string = getValues('password');
    const isCorrectPassword: boolean = password === SUPER_ADMIN_PASSWORD;
    if (isCorrectPassword) {
      const formData = getValues();
      await updateAdminOrganizationById(organizationId, {
        license: currentPeriod?.value as ELicenseType,
        isThemeSetting: formData?.isThemeSetting,
        isStandardUserCanAccessUser: formData?.isStandardUserCanAccessUser,
        isModularProcess: formData?.isModularProcess,
        isReportTool: formData?.isReportTool,
        isCollectionFeature: formData?.isCollectionFeature,
        isMarketPlace: formData?.isMarketPlace,
      });
      await fetchData();
      setIsOpenComfirmModal(false);
      toast.success('Already update changes.');
    } else {
      toast.error('Password is incorrect.');
    }
  }

  async function fetchData(): Promise<void> {
    const { startTime, endTime } = getTimeRangeByPeriod(period as EPeriod);
    if (startTime && endTime) {
      reportStore.fetchCompanyReportDetail(organizationId, {
        startDate: startTime,
        endDate: endTime,
      });
    }
  }

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  useEffect(() => {
    if (companyReportDetail) {
      const formData: ICompanyReportForm =
        getCompanyReportFormData(companyReportDetail);
      reset(formData);
      setCurrentPeriod(formData?.license);
    }
  }, [companyReportDetail]);

  return (
    <FormProvider {...methods}>
      <chakra.form
        onSubmit={handleSubmit(onSubmit)}
        width="full"
        maxWidth="1320px"
      >
        <Stack
          width="full"
          flexDirection={{ base: 'column', lg: 'row' }}
          gap={6}
          spacing={0}
        >
          <VStack spacing={6}>
            <VStack
              width={{ base: 'full', lg: '421px' }}
              align="flex-start"
              background="white"
              borderRadius={8}
              padding={6}
              spacing={4}
            >
              <Text
                color="black"
                fontSize="24px"
                fontWeight={600}
                lineHeight={8}
              >
                License Information
              </Text>
              <Img
                src={
                  companyReportDetail?.welcomeMessageImage ??
                  companyReportDetail?.logo ??
                  MissingImage
                }
                boxSize="108px"
                borderRadius={4}
              />
              <FormView label="Current License">
                <Tag
                  width="fit-content"
                  color={getLicenseTagColor(
                    companyReportDetail?.license ?? ELicenseType.FREE
                  )}
                  background={getLicenseTagBackground(
                    companyReportDetail?.license ?? ELicenseType.FREE
                  )}
                >
                  {capitalize(
                    companyReportDetail?.license ?? ELicenseType.FREE
                  )}
                </Tag>
              </FormView>
              <FormView label="Updated Time" name="updatedAt" />
              <FormView label="Expired Time" name="expiredAt" />
            </VStack>
            <VStack
              width={{ base: 'full', lg: '421px' }}
              align="flex-start"
              background="white"
              borderRadius={8}
              padding={6}
              spacing={4}
            >
              <Text
                color="black"
                fontSize="24px"
                fontWeight={600}
                lineHeight={8}
              >
                Company Overview
              </Text>
              <FormView label="Last Login" name="lastLogin" />
              <FormView label="Total Logins" name="totalLogin" />
              <FormView label="Users" name="totalUser" />
              <FormView label="Processes" name="totalProcess" />
              <FormView label="Collections" name="totalCollection" />
              <FormView label="Views" name="totalView" />
              <FormView label="Edits" name="totalEdit" />
            </VStack>
          </VStack>
          <VStack
            width="full"
            height="fit-content"
            background="white"
            borderRadius={8}
            padding={6}
            spacing={6}
          >
            <HStack width="full" justify="space-between">
              <Text
                color="black"
                fontSize="24px"
                fontWeight={600}
                lineHeight={8}
              >
                Features Management
              </Text>
              <Button
                gap={2}
                color="white"
                variant="outline"
                fontSize="14px"
                fontWeight={500}
                lineHeight={6}
                paddingX={4}
                background={currentTheme?.primaryColor ?? 'primary.500'}
                _hover={{
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                  background: currentTheme?.primaryColor ?? 'primary.700',
                }}
                onClick={() => setIsOpenComfirmModal(true)}
              >
                <SvgIcon size={16} iconName="save_ic" />
                Save
              </Button>
            </HStack>
            <VStack width="full" align="flex-start" spacing={4}>
              <VStack width="full" align="flex-start" spacing={0}>
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight={600}
                  lineHeight={6}
                >
                  License Management
                </Text>
                <Text
                  color="gray.500"
                  fontSize="14px"
                  fontWeight={400}
                  lineHeight={5}
                >
                  You can upgrade/downgrade company’s license type. This will
                  affect features the company can use.
                </Text>
              </VStack>
              <Dropdown
                name="license"
                width="full"
                options={licenseOptions}
                item={currentPeriod}
                setValue={(name: string, value: IDropdown) =>
                  setCurrentPeriod(value)
                }
              />
            </VStack>
            <VStack width="full" align="flex-start" spacing={4}>
              <VStack width="full" align="flex-start" spacing={0}>
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight={600}
                  lineHeight={6}
                >
                  Features Management
                </Text>
                <Text
                  color="gray.500"
                  fontSize="14px"
                  fontWeight={400}
                  lineHeight={5}
                >
                  Customize features for each company to get better experiences.
                </Text>
              </VStack>
              <FormSwitch
                label="Collection feature"
                name="isCollectionFeature"
                setValue={setValue}
              />
              <FormSwitch
                label="Themes Settings"
                name="isThemeSetting"
                setValue={setValue}
              />
              <FormSwitch
                label="Standard User Can Access Users"
                name="isStandardUserCanAccessUser"
                setValue={setValue}
              />
              <FormSwitch
                label="Report Tools"
                name="isReportTool"
                setValue={setValue}
              />
              {/* <FormSwitch label="Modular Process" name="isModularProcess" setValue={setValue} /> */}
              {/* <FormSwitch label="Marketplace feature" name="isMarketPlace" setValue={setValue} /> */}
            </VStack>
          </VStack>
        </Stack>
      </chakra.form>
      <ConfirmModal
        titleText="Update Confirmation"
        bodyText={
          <VStack width="full" align="flex-start">
            <Text
              color="gray.700"
              fontSize="16px"
              fontWeight={400}
              lineHeight={6}
            >
              This action will affect the current operation of company. You have
              to confirm it by enter your password.
            </Text>
            <Input
              type="password"
              placeholder="Enter password"
              background="#E8F0FE"
              {...register('password')}
            />
          </VStack>
        }
        isOpen={isOpenComfirmModal}
        onClose={() => setIsOpenComfirmModal(false)}
        onClickAccept={onSubmit}
      />
    </FormProvider>
  );
};

export default observer(CompanyDetailPage);
