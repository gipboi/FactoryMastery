import { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import {
  FormProvider,
  useForm,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormGroup, Input, Label } from 'reactstrap';
import { IOption } from 'types/common';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import { IGroup } from 'interfaces/groups';
import { IGroupsFilterForm } from 'interfaces/groups';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { allSortingUserOptions } from './constants';
import { getCollectionOptionSelect, getUserOptionSelect } from './utils';
import styles from './groupFilterDialog.module.scss';
import ChakraFormRadioGroup from 'components/ChakraFormRadioGroup';
import MultiSelectFilter from 'components/MultiSelectFilter';
import CustomButton from 'pages/UserPage/components/CustomButton';
import { IUser } from 'interfaces/user';
import { ICollection } from 'interfaces/collection';

interface IGroupFilterDialogProps {
  className?: string;
  isOpen: boolean;
  toggle: () => void;
  onApplyFilter?: Function;
}

const GroupFilterDialog = ({
  onApplyFilter = () => {},
  ...props
}: IGroupFilterDialogProps) => {
  const { isOpen, toggle } = props;
  const { authStore, collectionStore, userStore } = useStores();
  const { userDetail } = authStore;
  const organizationId: string = userDetail?.organizationId ?? '';
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filterSortBy = params.get('sortBy') ?? '';
  // const filterUsers = params.get('users') ?? '';
  // const filterCollections = params.get('collections') ?? '';
  const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<
    IOption<string>[]
  >([]);

  const methods: UseFormReturn<IGroupsFilterForm> = useForm<IGroupsFilterForm>({
    defaultValues: {
      sortBy: filterSortBy,
      users: selectedUsers,
      collections: selectedCollections,
    },
  });
  const { register, handleSubmit, reset, setValue, control } = methods;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const users: IOption<string>[] = useWatch({ name: 'users', control });
  const collections: IOption<string>[] = useWatch({
    name: 'collections',
    control,
  });
  const isBasicUser: boolean =
    userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  async function onSubmit(data: IGroupsFilterForm) {
    setIsLoading(true);
    const userIds: string[] = (data?.users ?? []).map(
      (user: IOption<string>) => user?.value ?? ''
    );
    const collectionIds: string[] = (data?.collections ?? []).map(
      (collection: IOption<string>) => collection?.value ?? ''
    );

    params.set('users', userIds?.join(',') ?? '');
    params.set('collections', collectionIds?.join(',') ?? '');
    params.set('sortBy', data?.sortBy ?? '');
    params.set('page', '1');

    navigate(`${routes.groups.value}?${params.toString()}`);
    setIsLoading(false);
    onApplyFilter();
  }

  function clearAllUsersFilter(): void {
    setSelectedUsers([]);
    setValue('users', []);
  }

  function clearAllCollectionsFilter(): void {
    setSelectedCollections([]);
    setValue('collections', []);
  }

  function clearAllFilter(): void {
    clearAllUsersFilter();
    clearAllCollectionsFilter();
    setValue('sortBy', '');
  }

  useEffect(() => {
    reset({
      sortBy: filterSortBy,
      users: selectedUsers,
      collections: selectedCollections,
    });
    if (props.isOpen) {
      userStore.getUsers({ where: { organizationId } });
      collectionStore.fetchCollectionsByFilter({ organizationId });
    }
  }, [props.isOpen, organizationId]);

  function handleFilterState(): void {
    if (users) {
      const remainUsers: IUser[] = getValidArray(userStore.users).filter(
        (user: IUser) =>
          !getValidArray(users).find(
            (option: IOption<string>) => option?.value === String(user?.id)
          )
      );
      setSelectedUsers(users);
    }

    if (collections) {
      const remainCollections: ICollection[] = getValidArray(
        collectionStore.collections
      ).filter(
        (collection: ICollection) =>
          !getValidArray(collections).find(
            (option: IOption<string>) =>
              option?.value === String(collection?.id)
          )
      );

      setSelectedCollections(collections);
    }
  }

  useEffect(() => {
    handleFilterState();
  }, [users, collections]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={toggle}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent minWidth={isMobile ? 'auto' : '800px'}>
            <ModalHeader
              fontSize="lg"
              fontWeight={500}
              lineHeight={7}
              color="gray.800"
            >
              Filter Groups
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
                    label="Sort Order"
                    optionsData={allSortingUserOptions}
                  />
                </VStack>
                <VStack width="full" alignItems="flex-start" spacing={6}>
                  <MultiSelectFilter
                    name="users"
                    label="Users"
                    placeholder="Search users by name"
                    options={getUserOptionSelect(userStore?.users)}
                    selectedData={selectedUsers}
                    clearAllHandler={clearAllUsersFilter}
                    disabled={isBasicUser}
                  />

                  <MultiSelectFilter
                    name="collections"
                    label="Collections"
                    placeholder="Search collections by name"
                    options={getCollectionOptionSelect(
                      collectionStore.collections
                    )}
                    selectedData={selectedCollections}
                    clearAllHandler={clearAllCollectionsFilter}
                    disabled={isBasicUser}
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
                    className={'primary-override'}
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

export default observer(GroupFilterDialog);
