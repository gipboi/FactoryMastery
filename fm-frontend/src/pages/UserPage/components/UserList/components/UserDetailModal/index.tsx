/* eslint-disable max-lines */
import { useEffect } from "react";
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
} from "@chakra-ui/react";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import startCase from "lodash/startCase";
import { observer } from "mobx-react";
import { Controller, useForm, FormProvider, useWatch } from "react-hook-form";
import { Col } from "reactstrap";
import { getUserById } from "API/user";
import FormInput from "components/FormInput";
import InputGroup from "components/InputGroup";
import { ModalDialogProps } from "components/ModalDialog";
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
} from "constants/formValidations";
import { EBreakPoint } from "constants/theme";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { checkDuplicateUserInOrganization } from "utils/user";
import styles from "./styles.module.scss";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { IGroupOption } from "interfaces/groups";
import { getValidArray } from "utils/common";
import CustomGroupPermissionInput from "pages/UserPage/components/CustomGroupPermissionInput";
import CustomButton from "pages/UserPage/components/CustomButton";

export interface IUserDetailForm {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  userType: string | number;
  password: string;
  groupPermissions: IGroupOption[];
}

const initialFormValues: IUserDetailForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  userType: AuthRoleNameEnum.BASIC_USER,
  groupPermissions: [],
};

interface IUserDetailModalProps extends Omit<ModalDialogProps, "headless"> {
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
  const { groupStore, organizationStore, userStore } = useStores();
  const { groups } = groupStore;
  const { currentUser } = userStore;
  const organizationId = organizationStore?.organization?.id;
  const groupOptions = Array.isArray(groups)
    ? groups.map((group) => ({
        groupId: group.id,
        permission: GroupMemberPermissionEnum.VIEWER,
        admin: false,
      }))
    : [];

  const formDefaultValues = defaultValues ?? { ...initialFormValues };
  const methods = useForm<IUserDetailForm>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: formDefaultValues,
  });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;
  const userType = useWatch({
    control: control,
    name: "userType",
  });
  const usernameWatcher = useWatch({
    control: control,
    name: "username",
  });
  const emailWatcher = useWatch({
    control: control,
    name: "email",
  });
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  useEffect(() => {
    if (usernameWatcher) {
      validateUsernameAndEmail(usernameWatcher, "username");
    }
    if (emailWatcher) {
      validateUsernameAndEmail(emailWatcher, "email");
    }
  }, [usernameWatcher, emailWatcher]);

  useEffect(() => {
    resetForm();
  }, [defaultValues]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  async function validateUsernameAndEmail(
    value: string,
    fieldName: "email" | "username"
  ) {
    if (!value) {
      return;
    }
    const haveDuplicate = await checkDuplicateUserInOrganization(
      value,
      organizationId ?? "",
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
      const user = await getUserById(defaultValues.id, {
        include: ["groupMembers"],
      });
      defaultValues.userType = String(AuthRoleNameEnum.BASIC_USER);
      const groupPermissions = getValidArray(user?.groupMembers)
        .map((groupMember) => {
          const foundOption = groupOptions.find(
            (option) => option.groupId === groupMember.groupId
          );
          return foundOption
            ? {
                ...foundOption,
                admin: groupMember.admin,
                permission: groupMember.permission,
              }
            : null;
        })
        .filter(Boolean) as { admin: boolean; groupId: string }[];

      defaultValues.groupPermissions = groupPermissions;
    }
    reset(defaultValues);
  }

  function handleCancel(): void {
    reset(formDefaultValues);
    toggle();
  }

  return (
    <FormProvider {...methods}>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
        <ModalOverlay />
        <ModalContent minWidth={isMobile ? "auto" : "800px"}>
          <ModalHeader
            fontSize="lg"
            fontWeight={500}
            lineHeight={7}
            color="gray.800"
          >
            Add new user
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
                        message: "Username is required",
                      },
                      pattern: {
                        value: USERNAME_PATTERN,
                        message: "Invalid username",
                      },
                      validate: {
                        checkExisted: async (value) => {
                          if (value && organizationId) {
                            const haveDuplicate =
                              await checkDuplicateUserInOrganization(
                                value,
                                organizationId,
                                "username"
                              );
                            return haveDuplicate ? "Username exists" : true;
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
                        error={get(errors, `username.message`, "")}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={"fullName"}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: "Name is required",
                      },
                      pattern: {
                        value: NAME_PATTERN,
                        message: "No white space at beginning or end",
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
                        error={get(errors, `fullName.message`, "")}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={"email"}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: "Email is required",
                      },
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: "Invalid email address",
                      },
                      validate: {
                        checkExisted: async (value) => {
                          if (value && organizationId) {
                            const haveDuplicate =
                              await checkDuplicateUserInOrganization(
                                value,
                                organizationId,
                                "email"
                              );
                            return haveDuplicate ? "Email exists" : true;
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
                        error={get(errors, `email.message`, "")}
                      />
                    )}
                  />
                </Col>
                <Col lg className={styles.formInput}>
                  <Controller
                    name={"password"}
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: "Password is required",
                      },
                      minLength: {
                        value: 8,
                        message: "Password must at least 8 characters",
                      },
                      pattern: {
                        value: PASSWORD_PATTERN,
                        message:
                          "Password must have at least one uppercase, one lowercase, one digit",
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
                        error={get(errors, `password.message`, "")}
                      />
                    )}
                  />
                </Col>
              </SimpleGrid>
              <Box>
                <FormInput name="userType" label="User type">
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
                            value={String(AuthRoleNameEnum.BASIC_USER)}
                          >
                            {AuthRoleNameEnum.BASIC_USER}
                          </Radio>
                          <Radio
                            colorScheme="primary"
                            width="240px"
                            value={String(AuthRoleNameEnum.MANAGER)}
                          >
                            {AuthRoleNameEnum.MANAGER}
                          </Radio>
                          {currentUser?.authRole ===
                            AuthRoleNameEnum.ORG_ADMIN && (
                            <Radio
                              colorScheme="primary"
                              width="240px"
                              value={String(AuthRoleNameEnum.ORG_ADMIN)}
                            >
                              {AuthRoleNameEnum.ORG_ADMIN}
                            </Radio>
                          )}
                        </HStack>
                      </RadioGroup>
                    )}
                  />
                </FormInput>
              </Box>
              {userType === String(AuthRoleIdEnum.BASIC_USER) && (
                <CustomGroupPermissionInput
                  name="groupPermissions"
                  control={control}
                  rules={{ required: true }}
                  defaultValue={[]}
                  label="Assign user to groups"
                  placeholder="Search groups by name"
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
              className={"primary-override"}
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
