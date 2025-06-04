import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  FormControl,
  FormLabel,
  HStack,
  InputGroup,
  Text,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import { includes } from 'lodash';
import debounce from 'lodash/debounce';
import set from 'lodash/set';
import trim from 'lodash/trim';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { getValidArray } from 'utils/common';
import { getName } from 'utils/user';

interface IUserAndGroupDropdownProps {}

const UserAndGroupDropdown = (props: IUserAndGroupDropdownProps) => {
  const { authStore, groupStore, organizationStore, userStore } = useStores();
  const { organization } = organizationStore;
  const { userDetail } = authStore;
  const { currentUserGroupMembers, users } = userStore;
  const { groups } = groupStore;
  const userGroupIds = currentUserGroupMembers?.map(
    (groupMember) => groupMember.groupId
  );
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const organizationId = organization?.id ?? '';

  const { control } = useFormContext();
  const [optionsData, setOptionsData] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const debouncedFetchOptionsData = debounce(fetchOptionsData, 500);

  function fetchOptionsData(searchText: string = '') {
    const filterGroup = {
      where: {
        organizationId,
        name: { $regex: trim(searchText), $options: 'i' },
      },
      fields: ['id', 'name'],
      include: ['groupMembers'],
    };
    if (isBasicUser) {
      set(filterGroup, 'where.id', { inq: userGroupIds });
    }

    groupStore.getGroups(filterGroup);
    userStore.getUsers({
      where: {
        organizationId,
        $or: [
          { firstName: { $regex: trim(searchText), $options: 'i' } },
          { lastName: { $regex: trim(searchText), $options: 'i' } },
          { fullName: { $regex: trim(searchText), $options: 'i' } },
        ],
        disabled: false,
      },
      fields: [
        'id',
        'firstName',
        'lastName',
        'email',
        'username',
        'image',
        'organizationId',
      ],
      limit: 40,
    });
  }

  useEffect(() => {
    debouncedFetchOptionsData(searchText);
  }, [searchText]);

  useEffect(() => {
    setOptionsData([
      ...getValidArray(users).map((user) => ({
        value: user?.id ?? '',
        label: getName(user) ?? '',
        icon: user.image ?? '',
      })),
      ...getValidArray(groups).map((group) => ({
        value: group?.id ?? '',
        label: group?.name ?? '',
        icon: '',
        isGroup: true,
      })),
    ]);
  }, [JSON.stringify(users), JSON.stringify(groups)]);

  const CustomOption = (props: any) => {
    const { innerRef, innerProps, data } = props;

    return (
      <HStack
        ref={innerRef}
        {...innerProps}
        spacing={4}
        width="full"
        color="gray.700"
        padding="8px 12px"
        opacity={1}
        cursor={'pointer'}
        _hover={{ background: 'gray.100' }}
      >
        <Avatar size="sm" name={data.label} src={data.icon ?? ''} />
        <Text fontSize="md">{data?.label ?? ''}</Text>
      </HStack>
    );
  };

  return (
    <FormControl width="full" id="subject">
      <FormLabel
        color="gray.700"
        fontFamily="Roboto"
        fontWeight="500"
        lineHeight={6}
        marginY={2}
      >
        Select Groups or Users
      </FormLabel>
      <Controller
        name="subject"
        control={control}
        render={({ field }) => (
          <InputGroup
            borderRadius="6px"
            width="full"
            background="white"
            cursor="pointer"
            isolation="unset"
          >
            <Select
              {...field}
              isSearchable
              options={optionsData}
              placeholder="Search by Group name or Username/Full name"
              closeMenuOnSelect={true}
              components={{
                Option: CustomOption,
                IndicatorSeparator: null,
                DropdownIndicator: () => (
                  <SearchIcon boxSize={4} color="gray.600" mr={2} />
                ),
              }}
              onInputChange={(value) => setSearchText(value)}
              size="md"
              isClearable
              chakraStyles={{
                container: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: 'full',
                  cursor: 'pointer',
                }),
                option: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: 'auto',
                  cursor: 'pointer',
                }),
                dropdownIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  bg: 'transparent',
                  px: 2,
                  cursor: 'pointer',
                }),
                indicatorSeparator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: 'none',
                }),
                clearIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: 'none',
                }),
                multiValueRemove: (provided: Record<string, unknown>) => ({
                  ...provided,
                  color: 'gray.700',
                }),
                placeholder: (provided: Record<string, unknown>) => ({
                  ...provided,
                  padding: '0',
                }),
                menu: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  boxShadow:
                    '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                }),
                menuList: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
          </InputGroup>
        )}
      />
    </FormControl>
  );
};

export default observer(UserAndGroupDropdown);
