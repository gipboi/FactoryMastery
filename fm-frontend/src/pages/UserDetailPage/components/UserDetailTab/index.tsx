import TabItems from 'components/TabItems';
import UserDetailPage from 'components/UserDetailPage';
import { AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import UserDetailPageEdit from 'pages/UserDetailPageEdit';
// import CollectionTab from "pages/UserDetailPage/components/CollectionTab";
import { getValidArray } from 'utils/common';
import GroupTab from '../GroupTab';
import ProcessList from '../ProcessList';
import { EUserDetailTabLabel } from './constants';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { get } from 'lodash';
import { filterUserDetail } from 'components/UserDetailPage/utils';
import { IFilter } from 'types/common';
import { IUserWithRelations } from 'interfaces/user';

const UserDetailTab = () => {
  const { userStore, organizationStore, groupStore } = useStores();
  const {
    isManageModeInUserDetail,
    currentUser,
    userDetail,
    countDetailProcess,
  } = userStore;
  const { organization } = organizationStore;
  const isEditMyself: boolean =
    String(currentUser?.id) === String(userDetail?.id);

  /**
   * Permission documentation:
   * - ORG_ADMIN: Can edit all users
   * - MANAGER: Can edit MANAGER and BASIC_USER
   * - BASIC_USER: Can edit themselves, but cannot change permission section
   */
  const canEditUserDetail: boolean =
    currentUser?.authRole === AuthRoleNameEnum.ORG_ADMIN ||
    (currentUser?.authRole === AuthRoleNameEnum.MANAGER &&
      userDetail?.authRole === AuthRoleNameEnum.BASIC_USER) ||
    currentUser?.authRole ===
      (userDetail?.authRole ?? AuthRoleNameEnum.BASIC_USER) ||
    isEditMyself;

  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const params = useParams();
  const userId = String(get(params, 'userId', ''));
  const organizationId = organization?.id ?? userDetail?.organizationId ?? '';

  const isShowDetailTab = isBasicUser;
  const labels = isShowDetailTab
    ? [
        EUserDetailTabLabel.USER_INFORMATION,
        `${EUserDetailTabLabel.GROUP} (${
          getValidArray(userDetail?.groupMembers).length
        })`,
        `${EUserDetailTabLabel.PROCESS} (${
          getValidArray(userDetail?.userProcesses).length ?? 0
        })`,
        // `${EUserDetailTabLabel.COLLECTION} (${countDetailCollection ?? 0})`,
      ]
    : [EUserDetailTabLabel.USER_INFORMATION];

  const contents = [
    !!isManageModeInUserDetail && canEditUserDetail ? (
      <UserDetailPageEdit />
    ) : (
      <UserDetailPage />
    ),
  ];
  if (isShowDetailTab) {
    contents.push(<GroupTab />, <ProcessList />);
  }

  useEffect(() => {
    if (userId) {
      userStore.getUserDetail(
        userId ?? '',
        filterUserDetail as IFilter<IUserWithRelations>
      );
    }
  }, [userId]);

  useEffect(() => {
    if (organizationId) {
      groupStore.getGroups({ where: { organizationId } });
    }
  }, [organizationId]);

  return (
    <TabItems labels={labels} contents={contents} isHidden={!isShowDetailTab} />
  );
};

export default observer(UserDetailTab);
