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
import { IGroup } from "interfaces/groups";
import { IUsersFilterForm } from "interfaces/user";
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
import { FormGroup, Input, Label } from "reactstrap";
import routes from "routes";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import CustomButton from "../CustomButton";
import { allSortingUserOptions } from "./constants";
import styles from "./userListFilterDialog.module.scss";
import {
  filterValueInArray,
  findValueInArray,
  getGroupOptionSelect,
} from "./utils";

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
  const { authStore, groupStore } = useStores();
  const organizationId: string = authStore.userDetail?.organizationId ?? "";
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filterRoles = params.get("user-types")?.split(",") ?? [];
  const filterSortBy = params.get("sortBy") ?? "";
  const validRoles = compact(filterRoles)
    .filter((role) =>
      Object.values(AuthRoleNameEnum).includes(role as AuthRoleNameEnum)
    )
    .map(String);
  const [selectedGroups, setSelectedGroups] = useState<IOption<string>[]>([]);
  const methods: UseFormReturn<IUsersFilterForm> = useForm<IUsersFilterForm>({
    defaultValues: {
      sortBy: filterSortBy,
      userTypes: validRoles,
      groups: selectedGroups,
    },
  });
  const { register, handleSubmit, reset, setValue, control } = methods;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groupOptions, setGroupOptions] = useState<IOption<string>[]>(
    getGroupOptionSelect(groupStore?.groups)
  );
  const groups: IOption<string>[] = useWatch({ name: "groups", control });

  async function onSubmit(data: IUsersFilterForm) {
    setIsLoading(true);
    const groupIds: string[] = (data?.groups ?? []).map(
      (group: IOption<string>) => group?.value ?? ""
    );
    params.set("user-types", data?.userTypes?.join(",") ?? "");
    params.set("groups", groupIds?.join(",") ?? "");
    params.set("sortBy", data?.sortBy ?? "");
    params.set("page", "1");
    navigate(`${routes.users.value}?${params.toString()}`);
    setIsLoading(false);
    onApplyFilter();
  }

  function clearAllGroupsFilter(): void {
    setSelectedGroups([]);
    setGroupOptions(getGroupOptionSelect(groupStore?.groups));
    setValue("groups", []);
  }

  function removeSelectedGroup(value: string): void {
    const removedGroup: IOption<string> = findValueInArray(
      value,
      selectedGroups
    );
    if (removedGroup) {
      const remainGroups: IOption<string>[] = filterValueInArray(
        value,
        selectedGroups
      );
      setValue("groups", remainGroups);
    }
  }

  function clearAllFilter(): void {
    clearAllGroupsFilter();
    setValue("userTypes", []);
    setValue("sortBy", "");
  }

  useEffect(() => {
    reset({
      sortBy: filterSortBy,
      userTypes: validRoles,
      groups: selectedGroups,
    });
    if (props.isOpen) {
      groupStore.getGroups({ where: { organizationId } });
      setGroupOptions(getGroupOptionSelect(groupStore?.groups));
    }
  }, [props.isOpen, organizationId]);

  useEffect(
    function handleGroupState(): void {
      if (groups) {
        const remainGroups: IGroup[] = getValidArray(groupStore.groups).filter(
          (group: IGroup) =>
            !getValidArray(groups).find(
              (option: IOption<string>) => option?.value === String(group?.id)
            )
        );
        setGroupOptions(getGroupOptionSelect(remainGroups));
        setSelectedGroups(groups);
      }
    },
    [groups]
  );

  const { ref: refUserTypes, ...registerUserTypes } = register("userTypes");

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
              Filter Users
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
                  <Text
                    color="gray.700"
                    fontSize="md"
                    lineHeight={6}
                    fontWeight={500}
                  >
                    User Types
                  </Text>
                  <HStack
                    width="full"
                    justifyContent="space-between"
                    margin="0 !important"
                  >
                    <FormGroup
                      className={styles.checkboxInputWrapper}
                      check
                      inline
                    >
                      <Input
                        type="checkbox"
                        id={AuthRoleNameEnum.BASIC_USER}
                        value={AuthRoleNameEnum.BASIC_USER}
                        innerRef={refUserTypes}
                        {...registerUserTypes}
                      />
                      <Label check htmlFor={AuthRoleNameEnum.BASIC_USER}>
                        Basic Users
                      </Label>
                    </FormGroup>

                    <FormGroup
                      className={styles.checkboxInputWrapper}
                      check
                      inline
                    >
                      <Input
                        type="checkbox"
                        id={AuthRoleNameEnum.MANAGER}
                        value={AuthRoleNameEnum.MANAGER}
                        innerRef={refUserTypes}
                        {...registerUserTypes}
                      />
                      <Label check htmlFor={AuthRoleNameEnum.MANAGER}>
                        Managers
                      </Label>
                    </FormGroup>

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
                      <Label check htmlFor={AuthRoleNameEnum.ORG_ADMIN}>
                        Organization Admins
                      </Label>
                    </FormGroup>
                  </HStack>
                  <MultiSelectFilter
                    name="groups"
                    label="Groups"
                    placeholder="Search groups by name"
                    options={groupOptions}
                    selectedData={selectedGroups}
                    clearAllHandler={clearAllGroupsFilter}
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

export default observer(UserListFilterDialog);
