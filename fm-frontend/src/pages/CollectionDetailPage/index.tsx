import GlobalSpinner from 'components/GlobalSpinner';
import { useStores } from 'hooks/useStores';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// import CollectionDetailPageEdit from 'components/Pages/CollectionDetailPageEdit'
import { AuthRoleNameEnum } from 'constants/user';
import CollectionDetailPage from 'pages/CollectionDetailPage/components/CollectionDetailPage';
import CollectionDetailPageEdit from 'pages/CollectionDetailPageEdit';
import routes from 'routes';
import { ICollection } from 'interfaces/collection';

const CollectionDetailLayout = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { userStore, collectionStore, authStore } = useStores();
  const { collection } = collectionStore;
  const { currentUser, userDetail } = userStore;
  const { isManageMode, isManagePermission } = collectionStore;
  const collectionId: string = String(get(params, 'collectionId', ''));
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionDetail, setCollectionDetail] = useState();

  // TODO: Delete later
  // useEffect(() => {
  //   // if (!!isManageMode && canEditUserDetail) {
  //   //   userStore.getUsers({ where: { isInactive: false, organizationId: currentUser.organizationId } })
  //   // }
  //   if (!isManageMode) {
  //     navigate(`${routes.collections.collectionId.value(`${collection?.id}`)}`)
  //   }
  // }, [isManageMode])

  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      await collectionStore.getCollectDetail(collectionId);
      // Simulate fetching data by using mock data
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      navigate(routes.dashboard.value, { replace: true });
      console.error('🚀 ~ fetchData ~ error:', error);
      toast.error(
        'You are not allowed to access this collection, redirecting back.'
      );
    }
  }

  useEffect(() => {
    collectionStore.resetCollection();
    fetchData();
  }, [collectionId]);

  if (isLoading) {
    return <GlobalSpinner />;
  }

  if (isBasicUser && !isManagePermission) {
    return <CollectionDetailPage collectionDetail={collection as ICollection} />;
  }

  return (
    <div>
      {!!isManageMode ? (
        <CollectionDetailPageEdit />
      ) : (
        <CollectionDetailPage collectionDetail={collection as ICollection} />
      )}
    </div>
  );
};

export default observer(CollectionDetailLayout);
