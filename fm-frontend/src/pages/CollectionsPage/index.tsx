import { IPagination } from "components/CkTable";
import ShareWithGroupsDialog from "components/ShareWithGroupsDialog";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { ICollection } from "interfaces/collection";
import { isNaN, toNumber } from "lodash";
import { observer } from "mobx-react";
import CollectionOverview from "pages/CollectionsPage/components/CollectionOverview";
import CollectionList from "pages/CollectionsPage/components/CollectionsList";
import { ViewMode } from "pages/CollectionsPage/constants";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import CkPagination from "../../components/CkPagination";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import Header from "./components/Header";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFirstRender = useRef(true);
  const {
    organizationStore,
    collectionStore,
    authStore,
    processStore,
    groupStore,
    documentTypeStore,
    tagStore,
  } = useStores();
  const persistedViewMode = isNaN(toNumber(params.get("viewMode")))
    ? ViewMode.List
    : toNumber(params.get("viewMode"));
  const [viewMode, setViewMode] = useState<ViewMode>(persistedViewMode);

  const persistedPage = Number(params.get("page") || "1");
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const { collections, totalCollections, size, isLoading, isManageMode } =
    collectionStore;

  function gotoPage(page: number): void {
    params.set("page", `${page}`);
    navigate(`${routes.collections.value}?${params.toString()}`);
  }

  const pagination: IPagination = {
    gotoPage: gotoPage,
    pageIndex: persistedPage,
    tableLength: totalCollections,
  };

  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);
  const [showFilterCollectionModal, setShowFilterCollectionModal] =
    useState(false);
  const [isOpenShareGroupDialog, setOpenShareGroupDialog] = useState(false);
  const [refetchCollectionAfterCreate, setRefetchCollectionAfterCreate] =
    useState<boolean>(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  function handleClickCollectionItem(collection: ICollection): void {
    if (collection && selectedCollectionId === collection.id) {
      setSelectedCollectionId("");
    } else if (collection && collection.id) {
      setSelectedCollectionId(collection.id);
    }
  }

  function changePageSize(size: number): void {
    collectionStore.changeSize(size);
  }

  useEffect(() => {
    if (refetchCollectionAfterCreate) {
      if (isFirstRender.current) {
        gotoPage(persistedPage);
        isFirstRender.current = false;
      } else {
        gotoPage(1);
      }
      setRefetchCollectionAfterCreate(false);
    }
  }, [refetchCollectionAfterCreate]);

  function fetchProcesses(): void {
    const organizationId: string = organizationStore.organization?.id ?? "";
    // processStore.search("", 0, organizationId); //Ask Tien
  }

  useEffect(() => {
    fetchProcesses();
    const organizationId: string = organizationStore.organization?.id ?? "";
    groupStore.getGroups({ where: { organizationId } });
    processStore.getAllProcessList(organizationId, 0);
    documentTypeStore.fetchDocumentTypes({
      where: { organizationId },
      order: ["name ASC"],
    });
    tagStore.fetchTags({ where: { organizationId } });
  }, []);

  function handleOverviewClose(): void {
    setSelectedCollectionId("");
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <Header
        viewMode={viewMode}
        changeViewMode={setViewMode}
        showFilterDialog={() => {
          setShowFilterCollectionModal(true);
        }}
        showCreateCollectionDialog={() => {
          setShowCreateCollectionModal(true);
        }}
      />
      <CollectionList
        isManageMode={isManageMode}
        items={collections}
        viewMode={viewMode}
        onItemClick={handleClickCollectionItem}
        selectedId={selectedCollectionId}
        gotoPage={gotoPage}
        pageSize={
          localStorage.getItem("collectionPageSize")
            ? Number(localStorage.getItem("collectionPageSize"))
            : size
        }
      />
      {
        // !isLoading
        <></> && (
          <CkPagination
            pagination={pagination}
            setPageSize={changePageSize}
            pageSize={size}
            pageSizeOptions={[8, 12, 20, 40, 100]}
            pageSizeKey="collectionPageSize"
          />
        )
      }
      <CreateModal
        isOpen={showCreateCollectionModal}
        onClose={() => {
          setShowCreateCollectionModal(false);
          fetchProcesses();
        }}
        reloadData={() => {
          setRefetchCollectionAfterCreate(true);
          // collectionStore.fetchCollectionsByFilter({}, true);
        }}
      />
      <ShareWithGroupsDialog
        isOpen={isOpenShareGroupDialog}
        toggle={() => {
          setOpenShareGroupDialog(!isOpenShareGroupDialog);
        }}
        isBasicUser={isBasicUser}
        onClose={() => setOpenShareGroupDialog(false)}
      >
        <></>
      </ShareWithGroupsDialog>
      <FilterModal
        isOpen={showFilterCollectionModal}
        onClose={() => setShowFilterCollectionModal(false)}
      />
      <CollectionOverview
        collectionId={selectedCollectionId}
        toggle={handleOverviewClose}
        isOpen={!!selectedCollectionId}
      />
    </div>
  );
};

export default observer(CollectionsPage);
