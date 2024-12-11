import {
  Box,
  chakra,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import FormInput from "components/FormInput";
import { PASSWORD_PATTERN } from "constants/formValidations";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import CustomButton from "pages/UserPage/components/CustomButton";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface IResetPasswordModalProps {
  toggle: () => void;
  isOpen: boolean;
}

interface IResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordModal = (props: IResetPasswordModalProps) => {
  const { toggle, isOpen } = props;
  const { userStore } = useStores();
  const { userDetail } = userStore;
  const { isLoading } = userStore;
  const methods = useForm<IResetPasswordForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });
  const { handleSubmit, reset } = methods;

  function onClose(): void {
    reset();
    toggle();
  }

  async function onSubmit(data: IResetPasswordForm) {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Password and confirm password not match");
      }
      await userStore.adminChangePassword(
        userDetail?.id ?? "",
        data?.newPassword
      );
      toast.success("Change password successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <FormProvider {...methods}>
          <chakra.form
            width="full"
            onSubmit={handleSubmit(onSubmit)}
            id="reset-password-form"
          >
            <ModalHeader
              fontSize="lg"
              lineHeight={7}
              color="gray.800"
              fontWeight={700}
            >
              Reset Password
            </ModalHeader>
            <ModalCloseButton
              width="40px"
              height="40px"
              boxShadow="unset"
              border="unset"
              background="#fff"
              _focus={{ borderColor: "unset" }}
              _active={{ borderColor: "unset" }}
              onClick={onClose}
            />
            <ModalBody>
              <Box marginBottom={4}>
                <FormInput
                  label="New Password"
                  name="newPassword"
                  type="password"
                  rules={{
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
                />
              </Box>
              <Box marginBottom={4}>
                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                />
              </Box>
            </ModalBody>
            <Divider color="gray.200" margin={0} />
            <ModalFooter>
              <CustomButton
                content="Cancel"
                className="outline"
                onClick={onClose}
                isLoading={isLoading}
              />
              <CustomButton
                form="reset-password-form"
                content="Save"
                type="submit"
                className="primary"
                isLoading={isLoading}
                background="primary500"
              />
            </ModalFooter>
          </chakra.form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default observer(ResetPasswordModal);
