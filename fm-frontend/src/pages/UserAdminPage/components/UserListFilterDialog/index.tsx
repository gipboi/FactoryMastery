import {
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  Stack,
  Box,
  Flex,
} from '@chakra-ui/react';
import ChakraFormRadioGroup from 'components/ChakraFormRadioGroup';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { IUsersFilterForm } from 'interfaces/user';
import compact from 'lodash/compact';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormGroup, Input, Label } from 'reactstrap';
import routes from 'routes';
import { IOption } from 'types/common';
import CustomButton from '../CustomButton';
import { allSortingUserOptions } from './constants';
import styles from './userListFilterDialog.module.scss';
import OrganizationStore from 'stores/organizationStore';
import { getOrganizationOptionSelect } from './utils';
import MultiSelectFilter from 'components/MultiSelectFilter';
import { getValidArray } from 'utils/common';
import { IOrganization } from 'interfaces/organization';

interface IUserListFilterDialogProps {
  className?: string;
  isOpen: boolean;
  toggle: () => void;
  onApplyFilter?: Function;
}

const UserListFilterDialog = ({
  onApplyFilter = () => {},
  ...props
}: IUserListFilterDialogProps) => {
  const { isOpen, toggle } = props;
  const { authStore, groupStore, organizationStore } = useStores();
  const organizationId: string = authStore.userDetail?.organizationId ?? '';
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filterRoles = params.get('user-types')?.split(',') ?? [];
  const filterSortBy = params.get('sortBy') ?? '';
  const validRoles = compact(filterRoles)
    .filter((role) =>
      Object.values(AuthRoleNameEnum).includes(role as AuthRoleNameEnum)
    )
    .map(String);
  const [selectedOrganizations, setSelectedOrganizations] = useState<
    IOption<string>[]
  >([]);
  const methods: UseFormReturn<IUsersFilterForm> = useForm<IUsersFilterForm>({
    defaultValues: {
      sortBy: filterSortBy,
      userTypes: validRoles,
      organizations: selectedOrganizations,
    },
  });
  const { register, handleSubmit, reset, setValue, control } = methods;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [organizationOptions, setOrganizationOptions] = useState<
    IOption<string>[]
  >(getOrganizationOptionSelect(organizationStore?.allOrganizations));
  const organizations: IOption<string>[] = useWatch({ name: "organizations", control }) ?? [];

  async function onSubmit(data: IUsersFilterForm) {
    setIsLoading(true);
    const organizationIds: string[] = (data?.organizations ?? []).map(
      (organization: IOption<string>) => organization?.value ?? ''
    );
    params.set('user-types', data?.userTypes?.join(',') ?? '');
    params.set('organizations', organizationIds?.join(',') ?? '');
    params.set('sortBy', data?.sortBy ?? '');
    params.set('page', '1');
    navigate(`${routes.admins.value}?${params.toString()}`);
    setIsLoading(false);
    onApplyFilter();
  }

  function clearAllFilter(): void {
    setValue('userTypes', []);
    setValue('sortBy', '');
  }

  function clearAllOrganizationsFilter(): void {
    setSelectedOrganizations([]);
    setOrganizationOptions(
      getOrganizationOptionSelect(organizationStore?.allOrganizations)
    );
    setValue('organizations', []);
  }

  useEffect(() => {
    reset({
      sortBy: filterSortBy,
      userTypes: validRoles,
    });
    if (props.isOpen) {
      groupStore.getGroups({ where: { organizationId } });

      if (!organizationStore?.allOrganizations?.length) {
        organizationStore.getAllOrganization();
      }
    }
  }, [props.isOpen, organizationId]);

  useEffect(() => {
    setOrganizationOptions(
      getOrganizationOptionSelect(organizationStore?.allOrganizations)
    );
  }, [organizationStore?.allOrganizations.length]);

  useEffect(
    function handleOrganizationState(): void {
      if (organizations) {
        const remainOrganizations: IOrganization[] = getValidArray(organizationStore.allOrganizations).filter(
          (organization: IOrganization) =>
            !getValidArray(organizations).find(
              (option: IOption<string>) => option?.value === String(organization?.id)
            )
        );
        setOrganizationOptions(getOrganizationOptionSelect(remainOrganizations));
        setSelectedOrganizations(organizations);
      }
    },
    [organizations.length]
  );

  const { ref: refUserTypes, ...registerUserTypes } = register('userTypes');

  return (
    <Modal 
      closeOnOverlayClick={false} 
      isOpen={isOpen} 
      onClose={toggle}
      size={{ base: "full", md: "4xl" }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent 
            minWidth={{ base: 'auto', md: '800px' }}
            margin={{ base: 0, md: 4 }}
            borderRadius={{ base: 0, md: '8px' }}
          >
            <ModalHeader
              fontSize={{ base: "md", md: "lg" }}
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
              px={{ base: 4, md: 6 }}
              py={{ base: 3, md: 4 }}
            >
              Filter Users
            </ModalHeader>
            <Divider color="gray.200" margin={0} />
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
              size={{ base: "sm", md: "md" }}
              top={{ base: 2, md: 3 }}
              right={{ base: 2, md: 3 }}
            />
            <ModalBody 
              padding={{ base: 4, md: 6 }}
            >
              <Stack 
                direction={{ base: 'column', lg: 'row' }}
                width="full" 
                alignItems="flex-start"
                spacing={{ base: 6, lg: 8 }}
              >
                {/* Sort By Section */}
                <VStack 
                  width={{ base: "full", lg: "235px" }} 
                  alignItems="flex-start"
                  spacing={4}
                  flexShrink={0}
                >
                  <ChakraFormRadioGroup
                    name="sortBy"
                    label="Sort By"
                    optionsData={allSortingUserOptions}
                  />
                </VStack>

                {/* User Types and Organizations Section */}
                <VStack 
                  width="full" 
                  alignItems="flex-start" 
                  spacing={{ base: 4, md: 6 }}
                  flex={1}
                >
                  {/* User Types */}
                  <Box width="full">
                    <Text
                      color="gray.700"
                      fontSize={{ base: "sm", md: "md" }}
                      lineHeight={6}
                      fontWeight={500}
                      mb={{ base: 3, md: 4 }}
                    >
                      User Types
                    </Text>
                    <Stack
                      direction={{ base: 'column', sm: 'row' }}
                      width="full"
                      justifyContent={{ base: 'flex-start', sm: 'space-between' }}
                      spacing={{ base: 3, sm: 4 }}
                      align="flex-start"
                    >
                      <FormGroup
                        className={styles.checkboxInputWrapper}
                        check
                        inline
                      >
                        <Input
                          type="checkbox"
                          id={AuthRoleNameEnum.ORG_ADMIN}
                          value={AuthRoleNameEnum.ORG_ADMIN}
                          innerRef={refUserTypes}
                          {...registerUserTypes}
                        />
                        <Label 
                          check 
                          htmlFor={AuthRoleNameEnum.ORG_ADMIN}
                          style={{ 
                            fontSize: isMobile ? '14px' : '16px',
                            marginLeft: '8px'
                          }}
                        >
                          Organization Admin
                        </Label>
                      </FormGroup>

                      <FormGroup
                        className={styles.checkboxInputWrapper}
                        check
                        inline
                      >
                        <Input
                          type="checkbox"
                          id={AuthRoleNameEnum.SUPER_ADMIN}
                          value={AuthRoleNameEnum.SUPER_ADMIN}
                          innerRef={refUserTypes}
                          {...registerUserTypes}
                        />
                        <Label 
                          check 
                          htmlFor={AuthRoleNameEnum.SUPER_ADMIN}
                          style={{ 
                            fontSize: isMobile ? '14px' : '16px',
                            marginLeft: '8px'
                          }}
                        >
                          Super Admin
                        </Label>
                      </FormGroup>
                    </Stack>
                  </Box>

                  {/* Organizations Multi-Select */}
                  <Box width="full">
                    <MultiSelectFilter
                      name="organizations"
                      label="Organizations"
                      placeholder="Search organizations by name"
                      options={organizationOptions}
                      selectedData={selectedOrganizations}
                      clearAllHandler={clearAllOrganizationsFilter}
                    />
                  </Box>
                </VStack>
              </Stack>
            </ModalBody>
            
            <Divider color="gray.200" margin={0} />
            
            <ModalFooter
              px={{ base: 4, md: 6 }}
              py={{ base: 3, md: 4 }}
            >
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                justifyContent="space-between" 
                width="full"
                spacing={{ base: 3, sm: 0 }}
                align={{ base: 'stretch', sm: 'center' }}
              >
                <Text
                  margin={0}
                  color="gray.700"
                  fontSize={{ base: "sm", md: "md" }}
                  lineHeight={6}
                  fontWeight={500}
                  cursor="pointer"
                  onClick={clearAllFilter}
                  textAlign={{ base: 'center', sm: 'left' }}
                  order={{ base: 2, sm: 1 }}
                  py={{ base: 2, sm: 0 }}
                >
                  Clear Filters
                </Text>
                
                <Flex
                  gap={{ base: 2, sm: 3 }}
                  order={{ base: 1, sm: 2 }}
                  width={{ base: 'full', sm: 'auto' }}
                  direction={{ base: 'row', sm: 'row' }}
                >
                  <CustomButton
                    content="Cancel"
                    className="outline"
                    onClick={toggle}
                    isLoading={isLoading}
                    width={{ base: 'full', sm: 'auto' }}
                    fontSize={{ base: "14px", md: "16px" }}
                    height={{ base: "40px", md: "40px" }}
                  />
                  <CustomButton
                    className={'primary-override'}
                    content="Apply"
                    type="submit"
                    isLoading={isLoading}
                    width={{ base: 'full', sm: 'auto' }}
                    fontSize={{ base: "14px", md: "16px" }}
                    height={{ base: "40px", md: "40px" }}
                  />
                </Flex>
              </Stack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(UserListFilterDialog);