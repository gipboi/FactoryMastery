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
} from "@chakra-ui/react";
import ChakraFormRadioGroup from "components/ChakraFormRadioGroup";
import MultiSelectFilter from "components/MultiSelectFilter";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { INotificationUsersFilterForm, IUser } from "interfaces/user";
import compact from "lodash/compact";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import {
  FormProvider,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { allSortingUserOptions } from "./constants";
import {
  filterValueInArray,
  findValueInArray,
  
} from "./utils";
import CustomButton from "pages/UserPage/components/CustomButton";
import { getUserOptionSelect } from "pages/GroupPage/components/GroupFilterDialog/utils";

interface INotificationListFilterDialogProps {
  className?: string;
  isOpen: boolean;
  toggle: () => void;
  onApplyFilter?: Function;
}

const NotificationListFilterDialog = ({
  onApplyFilter = () => {},
  ...props
}: INotificationListFilterDialogProps) => {
  const { isOpen, toggle } = props;
  const { authStore, userStore } = useStores();
  const organizationId: string = authStore.userDetail?.organizationId ?? "";
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filterRoles = params.get("user-types")?.split(",") ?? [];
  const filterSortBy = params.get("sortBy") ?? "";
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);
  const methods: UseFormReturn<INotificationUsersFilterForm> = useForm<INotificationUsersFilterForm>({
    defaultValues: {
      sortBy: filterSortBy,
      users: selectedUsers,
    },
  });
  const { handleSubmit, reset, setValue, control } = methods;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userOptions, setUserOptions] = useState<IOption<string>[]>(
    getUserOptionSelect(userStore?.users)
  );
  const users: IOption<string>[] = useWatch({ name: "users", control }) as IOption<string>[];

  async function onSubmit(data: INotificationUsersFilterForm) {
    setIsLoading(true);
    const groupIds: string[] = (data?.users ?? []).map(
      (group: IOption<string>) => group?.value ?? ""
    );
    params.set("users", groupIds?.join(",") ?? "");
    params.set("sortBy", data?.sortBy ?? "");
    params.set("page", "1");
    navigate(`${routes.notifications.value}?${params.toString()}`);
    setIsLoading(false);
    onApplyFilter();
  }

  function clearAllUsersFilter(): void {
    setSelectedUsers([]);
    setUserOptions(getUserOptionSelect(userStore.users));
    setValue("users", []);
  }

  function clearAllFilter(): void {
    clearAllUsersFilter();
    setValue("sortBy", "");
  }

  useEffect(() => {
    reset({
      sortBy: filterSortBy,
      users: selectedUsers,
    });
    if (props.isOpen) {
      userStore.getUsers({ where: { organizationId } });
      setUserOptions(getUserOptionSelect(userStore?.users));
    }
  }, [props.isOpen, organizationId]);

  useEffect(
    function handleUserState(): void {
      if (users) {
        const remainUsers: IUser[] = getValidArray(userStore.users).filter(
          (group: IUser) =>
            !getValidArray(users).find(
              (option: IOption<string>) => option?.value === String(group?.id)
            )
        );
        setUserOptions(getUserOptionSelect(remainUsers));
        setSelectedUsers(users);
      }
    },
    [users]
  );

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={isMobile ? "auto" : "800px"}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Filter Notifications
            </ModalHeader>
            <Divider color="gray.200" margin={0} />
            <ModalCloseButton
              background="white"
              border="none"
              boxShadow="none !important"
            />
            <ModalBody padding={6}>
              <HStack width="full" alignItems="flex-start">
                <VStack width="235px" alignItems="flex-start">
                  <ChakraFormRadioGroup
                    name="sortBy"
                    label="Sort By"
                    optionsData={allSortingUserOptions}
                  />
                </VStack>
                <VStack width="full" alignItems="flex-start" spacing={6}>
                  <MultiSelectFilter
                    name="users"
                    label="Users"
                    placeholder="Search users by name"
                    options={userOptions}
                    selectedData={selectedUsers}
                    clearAllHandler={clearAllUsersFilter}
                  />
                </VStack>
              </HStack>
            </ModalBody>
            <Divider color="gray.200" margin={0} />
            <ModalFooter>
              <HStack justifyContent="space-between" width="full">
                <Text
                  margin={0}
                  color="gray.700"
                  fontSize="md"
                  lineHeight={6}
                  fontWeight={500}
                  cursor="pointer"
                  onClick={clearAllFilter}
                >
                  Clear Filters
                </Text>
                <HStack>
                  <CustomButton
                    content="Cancel"
                    className="outline"
                    onClick={toggle}
                    isLoading={isLoading}
                  />
                  <CustomButton
                    className={"primary-override"}
                    content="Apply"
                    type="submit"
                    isLoading={isLoading}
                  />
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default observer(NotificationListFilterDialog);
