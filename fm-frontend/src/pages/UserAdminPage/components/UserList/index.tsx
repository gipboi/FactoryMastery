/* eslint-disable max-lines */
import {
  Box,
  HStack,
  Text,
} from '@chakra-ui/react';
import cx from 'classnames';
import CkTable, {
  IPagination,
  ITableHeader,
} from 'components/CkTable';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import isArray from 'lodash/isArray';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { primary500 } from 'themes/globalStyles';
import Avatar from 'components/Avatar';
import DeleteDialog from 'components/DeleteDialog';
import { AuthRoleIdEnum, AuthRoleNameEnum } from 'constants/user';
import { ITheme } from 'interfaces/theme';
import {
  IUserWithRelations,
} from 'interfaces/user';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { getFullName, getName } from 'utils/user';
import UserTypeTag from './components/UserTypeTag';
import { IUserListProps } from './constants';
import styles from './userList.module.scss';
import { ETableHeader } from './utils';

const UserList = ({
  enableActionControl,
  fetchUserList,
}: IUserListProps) => {
  const { authStore, userStore, groupStore, organizationStore } = useStores();
  const { users, currentUser, numberOfUsers } = userStore;
  const isEditable: boolean =
    currentUser?.authRole !== AuthRoleIdEnum.BASIC_USER;
  const organizationId: string =
    authStore.userDetail?.organizationId ??
    organizationStore.organization?.id ??
    '';
  const [isDeletedUsers, setIsDeletedUsers] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState(Array(10).fill(false));
  const isCheckedAll = selectedUsers.every(Boolean);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageIndex: number = Number(params.get('page')) || 1;
  const [pageSize, setPageSize] = useState<number>(20);

  const listSelectedUser: IUserWithRelations[] =
    getValidArray(users).filter(
      (user: IUserWithRelations, index) => selectedUsers[index]
    ) ?? [];
  const currentTheme: ITheme = {};

  useEffect(() => {
    return () => {
      userStore.clearStore();
      groupStore.resetStore();
    };
  }, []);

  useEffect(() => {
    if (isArray(selectedUsers)) {
      const hasUserSelected = selectedUsers.some((user: boolean) => user);
      enableActionControl(hasUserSelected);
    }
  }, [selectedUsers]);

  function gotoPage(newPage: number) {
    params.set('page', `${newPage}`);
    navigate(`${routes.admins.value}?${params.toString()}`);
  }

  const pagination: IPagination = {
    gotoPage: gotoPage,
    pageIndex,
    tableLength: numberOfUsers,
  };
  async function handleDeleteUserConfirmed(): Promise<void> {
    await Promise.all(
      getValidArray(listSelectedUser).map((user: IUserWithRelations) => {
        if (user?.id) {
          return userStore.updateUser(user.id, { disabled: true });
        }
        return null;
      })
    ).then(fetchUserList);
    setSelectedUsers(Array(pageSize).fill(false));
    setIsDeletedUsers(false);
  }

  useEffect(() => {
    fetchUserList();
  }, [pageSize, params.toString(), isEditable]);

  useEffect(() => {
    fetchUserList();
    if (organizationId) {
      groupStore.getGroups({ where: { organizationId } });
    }
    authStore.fetchauthRoles();
  }, [organizationId]);

  useEffect(() => {
    params.set('pageSize', `${pageSize}`);
    navigate(`${routes.admins.value}?${params.toString()}`);
  }, [pageSize]);

  const dataInTable = getValidArray<IUserWithRelations>(users).map(
    (user: IUserWithRelations, index: number) => {
      const fullName: string = getFullName(user.firstName, user.lastName);
      const avatarUrl = user?.image;
      let role = AuthRoleNameEnum.BASIC_USER;
      if (user?.authRole === AuthRoleNameEnum.ORG_ADMIN) {
        role = AuthRoleNameEnum.ORG_ADMIN;
      } else if (user?.authRole === AuthRoleNameEnum.MANAGER) {
        role = AuthRoleNameEnum.MANAGER;
      } else if (user?.authRole === AuthRoleNameEnum.SUPER_ADMIN) {
        role = AuthRoleNameEnum.SUPER_ADMIN;
      }

      return {
        ...user,
        checkbox: (
          <>
          </>
        ),
        name: (
          <HStack paddingLeft={6}>
            <Avatar
              src={avatarUrl}
              name={getName(user)}
              className={styles.avatar}
            />
            <Text
              className={cx(styles.pointer, {
                [styles.disabledLabel]: user?.disabled,
              })}
              margin={0}
            >
              {fullName ?? user?.username ?? 'N/A'}
            </Text>
          </HStack>
        ),
        email: (
          <Text
            className={cx({
              [styles.disabledLabel]: user?.disabled,
            })}
            margin={0}
          >
            {user.email}
          </Text>
        ),
        type: <UserTypeTag role={role} disabled={user?.disabled} />,
        lastLogin: (
          <Text
            className={cx({
              [styles.disabledLabel]: user?.disabled,
            })}
            margin={0}
          >
            {user?.lastSignInAt
              ? dayjs(user.lastSignInAt).format('MM/DD/YYYY')
              : ''}
          </Text>
        ),
        organizations: (
          <HStack>
            <Text
              className={cx(styles.pointer, {
                [styles.disabledLabel]: user?.disabled,
              })}
              margin={0}
              _hover={{
                cursor: 'pointer',
                color: currentTheme?.primaryColor ?? primary500,
              }}
            >
              {user?.organization?.name ?? 'N/A'}
            </Text>
          </HStack>
        ),
      };
    }
  );

  function getHeaderList(): ITableHeader[] {
    const headers: ITableHeader[] = [
      {
        Header: () => {
          return <span className={styles.tableName}>Name</span>;
        },
        accessor: ETableHeader.NAME,
      },
      {
        Header: 'Email',
        accessor: ETableHeader.EMAIL,
      },
      {
        Header: 'Type',
        accessor: ETableHeader.TYPE,
      },
      {
        Header: 'Last Login',
        accessor: ETableHeader.LAST_LOGIN,
      },
      {
        Header: 'Organization',
        accessor: ETableHeader.ORGANIZATION,
      },
    ];

    return headers;
  }

  return (
    <>
      <Box width="full" paddingBottom={6}>
        <CkTable
          headerList={getHeaderList()}
          tableData={dataInTable}
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
          spacingX={2}
          hasNoSort
        />
      </Box>
      <DeleteDialog
        title="Delete user"
        isOpen={isDeletedUsers}
        message="WARNING: THIS ACTION CANNOT BE UNDONE"
        toggle={() => setIsDeletedUsers(!isDeletedUsers)}
        onDelete={handleDeleteUserConfirmed}
        onCancel={() => setIsDeletedUsers(false)}
      />
    </>
  );
};
export default observer(UserList);
