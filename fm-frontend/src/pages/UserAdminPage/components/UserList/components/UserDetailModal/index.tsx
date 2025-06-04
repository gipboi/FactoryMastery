/* eslint-disable max-lines */
import { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  RadioGroup,
  Radio,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import get from 'lodash/get';
import startCase from 'lodash/startCase';
import { observer } from 'mobx-react';
import { Controller, useForm, FormProvider, useWatch } from 'react-hook-form';
import { Col } from 'reactstrap';
import { getUserById } from 'API/user';
import FormInput from 'components/FormInput';
import InputGroup from 'components/InputGroup';
import { ModalDialogProps } from 'components/ModalDialog';
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
} from 'constants/formValidations';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleIdEnum, AuthRoleNameEnum } from 'constants/user';
import { checkDuplicateUserInOrganization } from 'utils/user';
import styles from './styles.module.scss';
import { GroupMemberPermissionEnum } from 'constants/enums/group';
import { IGroupOption } from 'interfaces/groups';
import { getValidArray } from 'utils/common';
import CustomButton from 'pages/UserPage/components/CustomButton';
import { IOption } from 'types/common';
import FilterDropdown from 'components/FilterDropdown';

export interface IUserDetailForm {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  userType: string | number;
  password: string;
  groupPermissions: IGroupOption[];
  organizations?: string;
}

const initialFormValues: IUserDetailForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  userType: AuthRoleNameEnum.BASIC_USER,
  groupPermissions: [],
};

interface IUserDetailModalProps extends Omit<ModalDialogProps, 'headless'> {
  defaultValues?: IUserDetailForm;
  onSubmit: any;
}

const UserDetailModal = ({
  className,
  defaultValues,
  onSubmit,
  isOpen,
  onClose: toggle,
  isLoading,
  ...props
}: IUserDetailModalProps) => {
  const { groupStore, organizationStore } = useStores();
  const { allOrganizations, organization } = organizationStore;
  const organizationId = organization?.id;
  const formDefaultValues = defaultValues ?? { ...initialFormValues };
  const methods = useForm<IUserDetailForm>({
    reValidateMode: 'onBlur',
    mode: 'onBlur',
    defaultValues: formDefaultValues,
  });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = methods;
  const userType = useWatch({
    control: control,
    name: 'userType',
  });
  const usernameWatcher = useWatch({
    control: control,
    name: 'username',
  });
  const emailWatcher = useWatch({
    control: control,
    name: 'email',
  });
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [selectedOrganizations, setSelectedOrganizations] = useState<
    IOption<string>[]
  >([]);

  useEffect(() => {
    if (usernameWatcher) {
      validateUsernameAndEmail(usernameWatcher, 'username');
    }
    if (emailWatcher) {
      validateUsernameAndEmail(emailWatcher, 'email');
    }
  }, [usernameWatcher, emailWatcher]);

  useEffect(() => {
    resetForm();
  }, [defaultValues]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else {
      if (!allOrganizations?.length) {
        organizationStore.getAllOrganization();
      }
    }
  }, [isOpen]);

  async function validateUsernameAndEmail(
    value: string,
    fieldName: 'email' | 'username'
  ) {
    if (!value) {
      return;
    }
    const haveDuplicate = await checkDuplicateUserInOrganization(
      value,
      organizationId ?? '',
      fieldName
    );
    if (haveDuplicate) {
      methods.setError(fieldName, {
        message: `${startCase(fieldName)} exists`,
      });
    } else {
      methods.clearErrors(fieldName);
    }
  }

  async function resetForm(): Promise<void> {
    if (defaultValues?.id) {
      defaultValues.userType = String(AuthRoleNameEnum.SUPER_ADMIN);
    }
    reset(defaultValues);
  }

  function handleCancel(): void {
    reset(formDefaultValues);
    toggle();
  }

  function handleSelectedOptions(
    options: IOption<string>[],
    name: string,
    setSelectedOptions: (options: IOption<string>[]) => void
  ): void {
    const values = getValidArray(options).map((option) => {
      return { label: option?.label, value: option?.value };
    });
    setValue(`${name}` as any, values as any);
    setSelectedOptions(options);
  }

  return (
    <FormProvider {...methods}>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
        <ModalOverlay />
        <ModalContent minWidth={isMobile ? 'auto' : '800px'}>
          <ModalHeader
            fontSize="lg"
            fontWeight={500}
            lineHeight={7}
            color="gray.800"
          >
            Add new admin
          </ModalHeader>
          <Divider color="gray.200" margin={0} />
          <ModalCloseButton
            background="white"
            border="none"
            boxShadow="none !important"
          />
          <ModalBody padding={6} className={styles.body}>
            <VStack spacing={6} alignItems="flex-start">
              <SimpleGrid columns={2} columnGap={4} rowGap={6} width="full">
                <Col lg className={styles.formInput}>
                  <Controller
                    name="username"
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: 'Username is required',
                      },
                      pattern: {
                        value: USERNAME_PATTERN,
                        message: 'Invalid username',
                      },
                      validate: {
                        checkExisted: async (value) => {
                          if (value && organizationId) {
                            const haveDuplicate =
                              await checkDuplicateUserInOrganization(
                                value,
                                organizationId,
                                'username'
                              );
                            return haveDuplicate ? 'Username exists' : true;
                          }
                          return true;
                        },
                      },
                    }}
                    render={({ field }) => (
                      <InputGroup
                        label="Username"
                        labelClassName={styles.defaultLabel}
                        placeholder="Enter username"
                        type="text"
                        smallSpacing
                        {...field}
                        error={get(errors, `username.message`, '')}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={'fullName'}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: 'Name is required',
                      },
                      pattern: {
                        value: NAME_PATTERN,
                        message: 'No white space at beginning or end',
                      },
                    }}
                    render={({ field }) => (
                      <InputGroup
                        label="Full Name"
                        labelClassName={styles.defaultLabel}
                        placeholder="Enter full name"
                        type="text"
                        smallSpacing
                        {...field}
                        error={get(errors, `fullName.message`, '')}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={'email'}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: 'Email is required',
                      },
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: 'Invalid email address',
                      },
                      validate: {
                        checkExisted: async (value) => {
                          if (value && organizationId) {
                            const haveDuplicate =
                              await checkDuplicateUserInOrganization(
                                value,
                                organizationId,
                                'email'
                              );
                            return haveDuplicate ? 'Email exists' : true;
                          }
                          return true;
                        },
                      },
                    }}
                    render={({ field }) => (
                      <InputGroup
                        label="Email"
                        labelClassName={styles.defaultLabel}
                        placeholder="Enter user email address"
                        type="text"
                        smallSpacing
                        {...field}
                        error={get(errors, `email.message`, '')}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={'password'}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: 'Password is required',
                      },
                      minLength: {
                        value: 8,
                        message: 'Password must at least 8 characters',
                      },
                      pattern: {
                        value: PASSWORD_PATTERN,
                        message:
                          'Password must have at least one uppercase, one lowercase, one digit',
                      },
                    }}
                    render={({ field }) => (
                      <InputGroup
                        labelClassName={styles.defaultLabel}
                        label="Password"
                        placeholder="Enter password"
                        type="password"
                        smallSpacing
                        {...field}
                        error={get(errors, `password.message`, '')}
                      />
                    )}
                  />
                </Col>
              </SimpleGrid>
              <Box>
                <FormInput name="userType" label="Admin type">
                  <Controller
                    name="userType"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup
                        marginTop={2}
                        {...field}
                        value={String(field.value)}
                      >
                        <HStack
                          justifyContent="space-between"
                          alignItems="flex-start"
                          color="gray.700"
                        >
                          <Radio
                            colorScheme="primary"
                            width="240px"
                            value={String(AuthRoleNameEnum.ORG_ADMIN)}
                          >
                            {AuthRoleNameEnum.ORG_ADMIN}
                          </Radio>
                          <Radio
                            colorScheme="primary"
                            width="240px"
                            value={String(AuthRoleNameEnum.SUPER_ADMIN)}
                          >
                            {AuthRoleNameEnum.SUPER_ADMIN}
                          </Radio>
                        </HStack>
                      </RadioGroup>
                    )}
                  />
                </FormInput>
              </Box>
              {userType === String(AuthRoleIdEnum.ORG_ADMIN) && (
                <FilterDropdown
                  isOpenModal={isOpen}
                  isSelectSingleOption={true}
                  name={'organizations'}
                  label="Organization"
                  placeholder="Search organizations by name"
                  storeOptions={getValidArray(allOrganizations)}
                  filteredOptions={getValidArray([])}
                  selectedOptions={selectedOrganizations}
                  setSelectedOptions={(options: IOption<string>[]) =>
                    handleSelectedOptions(
                      options,
                      'organizations',
                      setSelectedOrganizations
                    )
                  }
                />
              )}
            </VStack>
          </ModalBody>
          <Divider color="gray.200" margin={0} />
          <ModalFooter>
            <CustomButton
              content="Cancel"
              className="outline"
              onClick={handleCancel}
              isLoading={isLoading}
            />
            <CustomButton
              content="Add"
              className={'primary-override'}
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FormProvider>
  );
};

export default observer(UserDetailModal);
