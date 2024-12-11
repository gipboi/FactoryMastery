import { useEffect, useState } from "react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Form, Input } from "reactstrap";
import { createGroup, updateGroupById } from "API/groups";
import ModalDialog, { ModalDialogProps } from "components/ModalDialog";
import Spinner from "components/Spinner";
import { IGroup, IGroupDetail } from "interfaces/groups";
import styles from "./styles.module.scss";
import { NotifyGroup } from "constants/group";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import FormInput from "components/FormInput";

interface IGroupDetailDialogProps
  extends Omit<ModalDialogProps, "headless" | "children"> {
  isEditMode: boolean;
  defaultValues?: IGroup;
  getGroupsQuery: () => void;
}

const GroupDetailDialog = ({
  isEditMode,
  defaultValues,
  className,
  getGroupsQuery,
  ...props
}: IGroupDetailDialogProps) => {
  const { userStore } = useStores();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<IGroupDetail>({
    defaultValues,
  });
  const { register, handleSubmit, reset } = methods;

  useEffect(() => {
    if (props.isOpen) {
      reset(defaultValues);
    }
  }, [props.isOpen]);

  async function onSubmit(data: IGroupDetail) {
    if (data?.numberOfMembers) {
      delete data.numberOfMembers;
    }
    if (isEditMode) {
      try {
        setIsLoading(true);
        await updateGroupById(defaultValues?.id ?? "", data);
        getGroupsQuery();
        toast.success(NotifyGroup.UPDATE_SUCCESS);
        setIsLoading(false);
      } catch (error: any) {
        toast.error(NotifyGroup.UPDATE_FALSE);
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        await createGroup({
          name: data.name,
          description: "",
          isCompanyGroup: false,
          archived: false,
          organizationId: userStore?.currentUser?.organizationId ?? "",
        });
        getGroupsQuery();
        toast.success(NotifyGroup.CREATE_SUCCESS);
        setIsLoading(false);
      } catch (error: any) {
        toast.error(NotifyGroup.CREATE_FALSE);
        setIsLoading(false);
      }
    }
    props.onClose();
  }

  const { ref, ...registerName } = register("name");

  return (
    <ModalDialog
      headless
      className={cx(styles.detailDialog, className)}
      {...props}
      title={isEditMode ? "Edit" : "Create New" + " Group"}
      footer={
        <div className={styles.actionBtns}>
          <Button
            color="info"
            textAlign="center"
            marginRight={4}
            onClick={(e) => {
              e.preventDefault();
              props.onClose();
            }}
          >
            Cancel
          </Button>
          {isLoading ? (
            <Button background="primary.500" color="white" textAlign="center">
              <Spinner color="white" />
            </Button>
          ) : (
            <Button
              background="primary.500"
              color="white"
              textAlign="center"
              type="submit"
            >
              {isEditMode ? "Save" : "Create"}
            </Button>
          )}
        </div>
      }
    >
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormInput
              name="name"
              label="Group name"
              autoComplete="off"
              isRequired
            />

            <FormControl id="overview">
              <FormLabel color="#313a46">Description (Optional)</FormLabel>
              <Textarea {...register("description")} />
            </FormControl>
          </VStack>
        </Form>
      </FormProvider>
    </ModalDialog>
  );
};

export default GroupDetailDialog;
