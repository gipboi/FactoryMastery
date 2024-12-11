/* eslint-disable max-lines */
import {
  Box,
  chakra,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  SimpleGrid,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { uploadFile } from "API/cms";
import { updateUserById, updateUserPermissionById } from "API/user";
import Avatar from "components/Avatar";
import FormInput from "components/Chakra/FormInput";
// import GeneralMessageModal from "components/GeneralMessageModal";
import { ReactComponent as IconTrashRed } from "assets/icons/trash-red.svg";
import DeleteDialog from "components/DeleteDialog";
import SvgIcon from "components/SvgIcon";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import {
  ICreateEditUserRequest,
  IUserDetailForm,
  IUserWithRelations,
} from "interfaces/user";
import { startCase } from "lodash";
import get from "lodash/get";
import { observer } from "mobx-react";
import { filter } from "pages/UserDetailPage/constants";
import CustomButton from "pages/UserPage/components/CustomButton";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { getValidArray } from "utils/common";
import {
  checkDuplicateUserInOrganization,
  getFirstAndLastName,
} from "utils/user";
import ResetPasswordModal from "./components/ResetPasswordModal";
import { primary500 } from "themes/globalStyles";
import { filterUserDetail } from "components/UserDetailPage/utils";
import { IFilter } from "types/common";

const initialFormValues: IUserDetailForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  userType: String(AuthRoleNameEnum.MANAGER),
  groupPermissions: [],
};

const UserDetailPageEdit = () => {
  const params = useParams();
  const userId = String(get(params, "userId", "") ?? "");
  const { userStore, groupStore, authStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { userDetail, currentUser } = userStore;
  const isBasicUser: boolean =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const currentUserRole: string = currentUser?.authRole ?? "";
  const { groups } = groupStore;
  const groupOptions = Array.isArray(groups)
    ? groups.map((group) => ({
        groupId: group.id,
        permissionId: GroupMemberPermissionEnum.VIEWER,
        admin: false,
      }))
    : [];
  const methods = useForm<IUserDetailForm>({
    reValidateMode: "onChange",
    mode: "onChange",
    defaultValues: userDetail?.id ? userDetail : initialFormValues,
  });
  const {
    reset,
    control,
    formState: { isDirty },
  } = methods;
  const navigate = useNavigate();

  const userType = useWatch({ control, name: "userType" });
  const usernameWatcher = useWatch({ control, name: "username" });
  const emailWatcher = useWatch({ control, name: "email" });

  const fileInputRef = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReportTool, setIsReportTool] = useState<boolean>(false);
  const [isMessageFullAccess, setIsMessageFullAccess] =
    useState<boolean>(false);
  const [isPermissionFormDirty, setIsPermissionFormDirty] =
    useState<boolean>(false);
  const [isPermissionFormLoading, setIsPermissionFormLoading] =
    useState<boolean>(false);
  const {
    isOpen: isOpenResetPasswordModal,
    onOpen: openResetPasswordModal,
    onClose: closeResetPasswordModal,
  } = useDisclosure();
  const {
    isOpen: isOpenMessageModal,
    onOpen: openMessageModal,
    onClose: closeMessageModal,
  } = useDisclosure();

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const isEditMyself: boolean =
    String(currentUser?.id) === String(userDetail?.id);
  const isHideSendMessage: boolean =
    (currentUserRole === AuthRoleIdEnum.BASIC_USER &&
      userDetail?.authRole === AuthRoleIdEnum.BASIC_USER) ||
    isEditMyself;
  const imageUrl = userDetail?.image
    ? (userDetail?.organizationId ?? "", userDetail.image)
    : "";
  async function validateUsernameAndEmail(
    value: string,
    fieldName: "email" | "username"
  ) {
    if (!value || value === userDetail?.[fieldName]) {
      return;
    }
    const haveDuplicate = await checkDuplicateUserInOrganization(
      value,
      userDetail?.organizationId ?? "",
      fieldName,
      true
    );
    if (haveDuplicate) {
      methods.setError(fieldName, {
        message: `${startCase(fieldName)} exists`,
      });
    } else {
      methods.clearErrors(fieldName);
    }
  }
  async function onSelectFile(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile(event.target.files[0]);
    try {
      const url = await uploadFile(
        userDetail?.organizationId ?? "",
        "image",
        event.target.files[0]
      );
      await updateUserById(userDetail?.id ?? "", {
        image: url,
      });
    } catch (error: any) {
      toast.error("Something wrong when upload picture");
    }
  }

  useEffect(() => {
    if (usernameWatcher) {
      validateUsernameAndEmail(usernameWatcher, "username");
    }
    if (emailWatcher) {
      validateUsernameAndEmail(emailWatcher, "email");
    }
  }, [usernameWatcher, emailWatcher]);

  useEffect(() => {
    if (userDetail?.id) {
      reset({
        ...userDetail,
        userType: String(userDetail?.authRole),
        groupPermissions: getValidArray(userDetail?.groupMembers)
          ?.map((groupMember) => {
            const foundOption = groupOptions.find(
              (option) => option.groupId === groupMember.groupId
            );
            return foundOption
              ? {
                  ...foundOption,
                  admin: groupMember.admin,
                  permissionId: groupMember.permission,
                }
              : null;
          })
          .filter(Boolean) as { admin: boolean; groupId: string }[],
      });
      setIsReportTool(userDetail?.isReportTool ?? false);
      setIsMessageFullAccess(userDetail?.isMessageFullAccess ?? false);
      setIsPermissionFormDirty(false);
    }
  }, [userDetail]);

  useEffect(() => {
    if (userId) {
      userStore.getUserDetail(
        userId ?? "",
        filterUserDetail as IFilter<IUserWithRelations>
      );
    }
  }, [userId]);

  async function onSubmit(values: IUserDetailForm): Promise<void> {
    setIsLoading(true);
    try {
      const fullName = values.fullName.trim();
      const { firstName, lastName } = getFirstAndLastName(fullName);

      const updatedUserData: ICreateEditUserRequest = {
        username: values?.username ?? undefined,
        email: values?.email ?? undefined,
        password: values?.password ?? undefined,
        firstName: fullName ? firstName : undefined,
        lastName: fullName ? lastName : undefined,
        authRole: String(values?.userType) ?? AuthRoleNameEnum.BASIC_USER,
        groups:
          Array.isArray(values?.groupPermissions) &&
          String(values?.userType) === AuthRoleNameEnum.BASIC_USER
            ? values?.groupPermissions?.map((group) => ({
                groupId: group?.groupId,
                permission: group?.permission as GroupMemberPermissionEnum,
                admin: group?.admin,
              }))
            : [],
      };
      await updateUserById(userId, updatedUserData);
      await userStore.getUserDetail(userId ?? 0, filter);
      toast.success("Update user successfully!");
      userStore.setManageModeInUserDetail(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data.error.message ??
          "Failed to update user. Please try again or contact support."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitPermission(): Promise<void> {
    setIsPermissionFormLoading(true);
    await updateUserPermissionById(userId, {
      isReportTool,
      isMessageFullAccess,
    });
    toast.success("Update permission successfully!");
    setIsPermissionFormDirty(false);
    setIsPermissionFormLoading(false);
    userStore.setManageModeInUserDetail(false);
  }

  async function deleteUser(): Promise<void> {
    try {
      await updateUserById(userId, { disabled: true }); //*INFO: disable user instead of delete
      toast.success("Delete user successfully!");
      navigate(routes.users.value);
    } catch (error: any) {
      toast.error(
        error?.response?.data.error.message ??
          "Failed to delete user. Please try again or contact support."
      );
    }
  }

  async function handleDisableEnableUsers(): Promise<void> {
    try {
      await updateUserById(userId, { disabled: !userDetail?.disabled });
      toast.success(
        `${!userDetail?.disabled ? "Disable" : "Enable"}  user successfully!`
      );
      userStore.setManageModeInUserDetail(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data.error.message ??
          `Failed to ${
            !userDetail?.disabled ? "disable" : "enable"
          } user. Please try again or contact support.`
      );
    }
  }

  return (
    <VStack width="full" height="full" spacing="6">
      {!isHideSendMessage && (
        <HStack justifyContent="flex-end" width="full">
          <CustomButton
            content="Send message"
            fontSize="16px"
            className="outline"
            color="gray.700"
            fontWeight="500"
            height="40px"
            leftIcon={<SvgIcon iconName="outline-message" size={16} />}
            margin={0}
            onClick={openMessageModal}
            background="white"
            disabled
          />
          <CustomButton
            content={userDetail?.disabled ? "Enable" : "Disable"}
            fontSize="16px"
            className="outline"
            color="gray.700"
            fontWeight="500"
            height="40px"
            leftIcon={<SvgIcon iconName="account-cancel" size={16} />}
            margin={0}
            onClick={handleDisableEnableUsers}
            background="white"
            disabled={isEditMyself}
          />
          <CustomButton
            content="Delete"
            fontSize="16px"
            className="outline"
            color="red.500"
            borderColor="red.500"
            fontWeight="500"
            height="40px"
            leftIcon={<IconTrashRed />}
            margin={0}
            onClick={onOpenDelete}
            background="white"
            disabled={isEditMyself}
          />
          <DeleteDialog
            title="Delete user"
            isOpen={isOpenDelete}
            message="Are you sure you want to delete this user?"
            toggle={onCloseDelete}
            onDelete={deleteUser}
            onCancel={onCloseDelete}
          />
        </HStack>
      )}
      <HStack spacing={6} width="full" alignItems="flex-start">
        <VStack width="full" margin-top="16px" spacing={6}>
          <FormProvider {...methods}>
            <chakra.form onSubmit={methods.handleSubmit(onSubmit)} width="full">
              <VStack
                width="full"
                background="white"
                borderRadius="8px"
                alignItems="flex-start"
                alignSelf="flex-start"
                padding={4}
                spacing={4}
              >
                <HStack
                  spacing={4}
                  minWidth="max-content"
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Text
                    fontSize="18px"
                    color="gray.800"
                    fontWeight="600"
                    lineHeight="28px"
                    marginBottom={0}
                  >
                    Detail
                  </Text>

                  <CustomButton
                    size="sm"
                    content="Save"
                    fontSize="14px"
                    background={currentTheme?.primaryColor ?? "primary.700"}
                    color="#ffffff"
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={!isDirty}
                    leftIcon={<SvgIcon iconName="ic-save" size={14} />}
                    _hover={{
                      opacity: !isDirty ? 0.6 : 1,
                      background: currentTheme?.primaryColor ?? "primary.700",
                    }}
                    _active={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                    }}
                    onClick={() => {}}
                  ></CustomButton>
                </HStack>
                <SimpleGrid columns={2} columnGap={4} rowGap={6} width="full">
                  <FormInput
                    name="username"
                    label="User Name"
                    autoComplete="off"
                  />
                  <FormInput
                    name="fullName"
                    label="Full Name"
                    autoComplete="off"
                  />
                  <FormInput
                    name="email"
                    label="Email Address"
                    autoComplete="off"
                  />
                  <Box>
                    <FormLabel
                      color="gray.700"
                      lineHeight={6}
                      marginBottom={0}
                      marginInlineEnd={0}
                      minWidth="200px"
                    >
                      Password
                    </FormLabel>
                    <Text
                      color={currentTheme?.primaryColor ?? primary500}
                      fontWeight="600"
                      fontSize="16px"
                      lineHeight="24px"
                      marginBottom={0}
                      marginTop={4}
                      cursor="pointer"
                      onClick={openResetPasswordModal}
                    >
                      Reset Password
                    </Text>
                  </Box>
                </SimpleGrid>
                <FormInput name="userType" label="User type">
                  <Controller
                    name="userType"
                    control={methods.control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup
                        marginTop={2}
                        {...field}
                        value={String(field.value)}
                      >
                        <HStack
                          spacing={14}
                          alignItems="flex-start"
                          color="gray.700"
                        >
                          {currentUser?.authRole ===
                            AuthRoleNameEnum.ORG_ADMIN && (
                            <Radio
                              colorScheme="primary"
                              value={AuthRoleNameEnum.ORG_ADMIN}
                            >
                              {AuthRoleNameEnum.ORG_ADMIN}
                            </Radio>
                          )}
                          <Radio
                            colorScheme="primary"
                            value={AuthRoleNameEnum.MANAGER}
                          >
                            {AuthRoleNameEnum.MANAGER}
                          </Radio>
                          <Radio
                            colorScheme="primary"
                            value={AuthRoleNameEnum.BASIC_USER}
                          >
                            {AuthRoleNameEnum.BASIC_USER}
                          </Radio>
                        </HStack>
                      </RadioGroup>
                    )}
                  />
                </FormInput>
              </VStack>
            </chakra.form>
          </FormProvider>
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
              <CustomButton
                size="sm"
                content="Save"
                fontSize="14px"
                background={currentTheme?.primaryColor ?? "primary.700"}
                color="white"
                isLoading={isPermissionFormLoading}
                isDisabled={!isPermissionFormDirty}
                leftIcon={<SvgIcon iconName="ic-save" size={14} />}
                _hover={{
                  opacity: !isPermissionFormDirty ? 0.6 : 1,
                  background: currentTheme?.primaryColor ?? "primary.700",
                }}
                _active={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                }}
                onClick={handleSubmitPermission}
              ></CustomButton>
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
                  isChecked={isReportTool}
                  onChange={(event) => {
                    setIsReportTool(event?.target?.checked);
                    setIsPermissionFormDirty(true);
                  }}
                />
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                >
                  {isReportTool ? "On" : "Off"}
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
                  isChecked={isMessageFullAccess}
                  onChange={(event) => {
                    setIsMessageFullAccess(event?.target?.checked);
                    setIsPermissionFormDirty(true);
                  }}
                />
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                >
                  {isMessageFullAccess ? "On" : "Off"}
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
            src={
              selectedFile ? URL.createObjectURL(selectedFile) : imageUrl ?? ""
            }
            name={userDetail?.fullName ?? ""}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={onSelectFile}
            style={{ display: "none" }}
          />
          <CustomButton
            content="Change image"
            width="full"
            fontSize="16px"
            background="#ffffff"
            border="1px solid #E2E8F0"
            color="gray.700"
            leftIcon={<SvgIcon iconName="ic-upload" size={16} />}
            onClick={() => fileInputRef?.current?.click()}
          ></CustomButton>
        </VStack>
      </HStack>
      <ResetPasswordModal
        isOpen={isOpenResetPasswordModal}
        toggle={
          isOpenResetPasswordModal
            ? closeResetPasswordModal
            : openResetPasswordModal
        }
      />
      {/* <GeneralMessageModal
        isOpen={isOpenMessageModal}
        toggle={isOpenMessageModal ? closeMessageModal : openMessageModal}
        recipient={userDetail as IUserWithRelations}
      /> */}
    </VStack>
  );
};

export default observer(UserDetailPageEdit);
