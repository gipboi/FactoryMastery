import { uploadFile } from "API/cms";
import { updateUserById } from "API/user";
import Icon from "components/Icon";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { IEditEditUserRequest } from "interfaces/user";
import { observer } from "mobx-react";
import CustomButton from "pages/UserPage/components/CustomButton";
import GroupPermissionInput from "pages/UserPage/components/GroupPermissionInput";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, ModalBody, ModalFooter } from "reactstrap";
import { getFirstAndLastName } from "utils/user";
import ChangePasswordSection from "./components/ChangePasswordSection";
import PersonalInformationSection from "./components/PersonalInformationSection";
import RoleSelectionSection from "./components/RoleSelectionSection";
import styles from "./styles.module.scss";
import { getDefaultValues } from "./utils";

interface IEditAccountModalProps {
  toggle: () => void;
  isOpen: boolean;
  userId: string;
  isProfile?: boolean;
}

interface IResetPassword {
  newPassword: string;
  oldPassword: string;
  confirmPassword: string;
}

const EditAccountModal = (props: IEditAccountModalProps) => {
  const { toggle, isOpen, userId, isProfile } = props;
  const title: string = isProfile ? "My Account" : "Edit User";
  const { userStore, authStore, groupStore } = useStores();
  const { selectedUserDetail } = userStore;
  const isMyAccount = userId === authStore?.userDetail?.id;
  const userDetail = isMyAccount ? userStore.userDetail : selectedUserDetail;
  const { groups } = groupStore;
  const groupOptions = Array.isArray(groups)
    ? groups.map((group) => ({
        label: group.name,
        value: String(group?.id) ?? "",
        admin: false,
        permission: GroupMemberPermissionEnum.VIEWER,
      }))
    : [];
  const [isLoading, setIsLoading] = useState(false);
  const defaultValues = getDefaultValues(userDetail, groupOptions);
  const methods = useForm({
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onBlur",
  });
  const formId = "MyAccount";
  const authRoleId =
    useWatch({ control: methods.control, name: "authRole" }) ||
    AuthRoleIdEnum.BASIC_USER;
  const isBasicUser =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  const { reset } = methods;

  function onClose(): void {
    reset();
    toggle();
  }
  useEffect(() => {
    if (isOpen && userId) {
      const filter = {
        include: [
          {
            relation: "groupMembers",
            scope: { include: [{ relation: "group" }] },
          },
        ],
      };
      userStore.getUserDetail(userId, filter, !isMyAccount);
    }
  }, [userId, isOpen]);

  useEffect(() => {
    const formValue = getDefaultValues(userDetail, groupOptions);
    methods.reset(formValue);
  }, [userDetail]);

  useEffect(() => {
    if (!isOpen) {
      methods.reset();
    }
  }, [isOpen]);

  async function onSubmit(data: any): Promise<void> {
    setIsLoading(true);
    let imageName = userDetail?.image;
    if (data?.imageFile) {
      try {
        const url = await uploadFile(
          userDetail?.organizationId ?? "",
          "image",
          data.imageFile
        );
        imageName = url;
      } catch (error: any) {
        toast.error("Something wrong when upload picture");
      }
    }
    const { firstName, lastName } = getFirstAndLastName(data?.fullName ?? "");

    const updatedUser: IEditEditUserRequest = {
      organizationId: userDetail?.organizationId ?? "",
      firstName,
      lastName,
      image: imageName ?? "",
      oldPassword: data?.oldPassword,
      newPassword: data?.newPassword,
    };
    if (data?.newPassword && !isProfile) {
      try {
        await userStore.adminChangePassword(userId, data.newPassword);
        delete updatedUser.oldPassword;
        delete updatedUser.newPassword;
      } catch (error: any) {
        toast.error("Change password failed");
      }
    }
    if (isProfile) {
      delete updatedUser.authRole;
      delete updatedUser.groups;
    }
    try {
      await updateUserById(userDetail?.id ?? "", updatedUser);
      methods.reset();
      isMyAccount && userStore.getUserDetail(userId);
      authStore.getMyUser();
      userStore.refetchUserList();
      toast.success("Update user successfully");
    } catch (error: any) {
      toast.error("Update user failed");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" zIndex={10000}>
      <div className={styles.overviewHeader}>
        <h1 className={styles.header}>{title}</h1>
        <button onClick={toggle}>
          <Icon icon="multiply" group="unicon" />
        </button>
      </div>
      <FormProvider {...methods}>
        <form id={formId} onSubmit={methods.handleSubmit(onSubmit)}>
          <ModalBody className={styles.modalWrapper}>
            <hr className={styles.separator} />
            <PersonalInformationSection userId={userId} />
            <hr className={styles.separator} />
            {!isProfile && <RoleSelectionSection />}
            {!isProfile && isBasicUser && (
              <GroupPermissionInput
                name="groupPermissions"
                control={methods.control}
                rules={{ required: false }}
                defaultValue={[]}
              />
            )}
            <ChangePasswordSection isProfile={isProfile} userId={userId} />
          </ModalBody>

          <ModalFooter>
            <CustomButton
              content="Cancel"
              className="outline"
              onClick={onClose}
              isLoading={isLoading}
            />
            <CustomButton
              content="Save"
              type="submit"
              className="primary"
              isLoading={isLoading}
              background="primary500"
            />
          </ModalFooter>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(EditAccountModal);
