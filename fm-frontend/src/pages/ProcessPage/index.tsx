/* eslint-disable max-lines */
import {
  createGroupProcess,
  createProcess,
  upsertProcessTags,
} from "API/process";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Row } from "reactstrap";
import { useDisclosure } from "@chakra-ui/react";
import ProcessSummary from "components/Common/ProcessSummary";
import { IPagination } from "components/Common/ProcessSummary/components/ProcessPagination";
import GlobalSpinner from "components/GlobalSpinner";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import { IProcess, IProcessWithRelations } from "interfaces/process";
import { isEmpty, isEqualWith, trim } from "lodash";
import { observer } from "mobx-react";
import routes from "routes";
import { UpdateBody } from "types/common/query";
import { getDefaultPageSize, getValidArray } from "utils/common";
import { getFullName } from "utils/user";
import { getProcessPipeline } from "./aggregate";
import { queryParser } from "./aggregate/queryParser";
import ActionSheet from "./components/ActionSheet";
import ProcessTab from "./components/ProcessTab";
import { EDraftTab } from "./constants";
import styles from "./styles.module.scss";
import { mapSortTitleToValue } from "./utils";
import CkPagination from "components/CkPagination";

const ProcessPage = () => {
  const { processStore, organizationStore, authStore, userStore } = useStores();
  const [loading, setLoading] = useState<boolean>(false);
  const { userDetail } = authStore;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const persistedTab: string = `${
    params.get("tab") || EDraftTab.PROCESS
  }` as EDraftTab;
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize());
  const [selectedProcessDraftList, setSelectedProcessDraftList] = useState<
    string[]
  >([]);
  const isManageMode = processStore.isManageModeInProcessList;
  const { selectedProcessId, newProcessGroupIds, processes } = processStore;

  const { organization } = organizationStore;
  const pageIndex: number = Number(params.get("page")) || 1;
  const collectionIds: string[] =
    (params.get("collectionIds") || "")
      .split(",")
      .filter(Boolean)
      .map(String) || [];
  const creatorIds: string[] =
    (params.get("creatorIds") || "").split(",").filter(Boolean).map(String) ||
    [];
  const documentTypeIds: string[] =
    (params.get("documentTypeIds") || "")
      .split(",")
      .filter(Boolean)
      .map(String) || [];
  const groupIds: string[] =
    (params.get("groupIds") || "").split(",").filter(Boolean).map(String) || [];
  const tagIds: string[] =
    (params.get("tagIds") || "").split(",").filter(Boolean).map(String) || [];
  const sortField: string = params.get("sortBy") || "createdAt";
  const search = trim(params.get("search") || "");
  const navigate = useNavigate();
  const isPublished = true;
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const {
    isOpen: isOpenProcess,
    onOpen: onOpenProcess,
    onClose: onCloseProcess,
  } = useDisclosure();
  const pagination: IPagination = {
    gotoPage,
    pageIndex: pageIndex ?? 0,
    tableLength:
      persistedTab === EDraftTab.COLLECTION
        ? 0
        : processes.filter((item) => item.isPublished === isPublished).length >
          0
        ? processStore.numberOfProcesses
        : 0,
  };
  const { currentUserGroupMembers, currentUser } = userStore;
  const userCanManage =
    currentUserGroupMembers?.some(
      (groupMember) =>
        groupMember?.permission === GroupMemberPermissionEnum.EDITOR
    ) || !isBasicUser;

  const [selectedCollectionId, setSelectedCollectionId] = useState<number>(0);

  function gotoPage(newPage: number) {
    params.set("page", `${newPage}`);
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  // function handleClickCollectionItem(collection: ICollection): void {
  //   if (collection && selectedCollectionId === collection.id) {
  //     setSelectedCollectionId(0);
  //   } else if (collection) {
  //     setSelectedCollectionId(collection.id);
  //   }
  // }

  async function fetchProcedures(organizationId?: string) {
    try {
      if (organizationId && userDetail?.id) {
        const dataPipeline = getProcessPipeline(
          organizationId,
          pageSize,
          pageSize * (pageIndex - 1),
          collectionIds,
          creatorIds,
          documentTypeIds,
          groupIds,
          tagIds,
          mapSortTitleToValue(sortField),
          false,
          isPublished,
          userDetail.id,
          userDetail.authRole,
          false,
          search,
          userDetail.authRole === AuthRoleNameEnum.BASIC_USER
        );
        await processStore.getProcessByAggregate(dataPipeline, queryParser);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  function handleClickProcessCard(
    process: IProcessWithRelations,
    storedProcessId: string
  ): void {
    const processId: string = process.id ?? "-1";
    if (isEqualWith(storedProcessId, processId)) {
      setActiveModal(!activeModal);
    }
    if (!isEqualWith(storedProcessId, processId)) {
      setActiveModal(true);
    }
    processStore.setSelectedProcess(process);
    processStore.setSelectedProcessId(String(processId));
  }

  async function handleCreateProcess(createRequest: UpdateBody<IProcess>) {
    setLoading(true);
    const tagIds = createRequest?.tagIds;
    if (createRequest?.tagIds) {
      delete createRequest.tagIds;
    }
    const newProcedure = await createProcess(createRequest);
    if (newProcedure?.id && tagIds) {
      await upsertProcessTags(newProcedure.id, tagIds);
    }
    await Promise.all(
      Array.isArray(newProcessGroupIds)
        ? newProcessGroupIds.map((groupId) =>
            createGroupProcess({ groupId, processId: newProcedure.id })
          )
        : []
    );
    processStore.setNewProcessGroupIds([]);
    navigate(`${routes.processes.value}/${newProcedure.id}`);
    setLoading(false);
  }

  function handleSelectProcess(
    id: string,
    type: string,
    isToggle: boolean = true,
    process?: IProcessWithRelations
  ): void {
    if (type === EDraftTab.PROCESS) {
      let newArray: string[] = selectedProcessDraftList;
      if (newArray.indexOf(id) !== -1) {
        isToggle && newArray.splice(newArray.indexOf(id), 1);
        setSelectedProcessDraftList([...newArray]);
      } else {
        setSelectedProcessDraftList([...newArray, id]);
      }
    }
    processStore.setSelectedProcessId(id);
  }

  function handleSelectAllProcess(): void {
    if (persistedTab === EDraftTab.PROCESS) {
      if (selectedProcessDraftList.length < processes.length) {
        setSelectedProcessDraftList([
          ...processes.map((process: IProcessWithRelations) => process?.id),
        ]);
      } else {
        setSelectedProcessDraftList([]);
      }
    }
  }

  function handleOpenProcessModal(process: IProcessWithRelations): void {
    handleClickProcessCard(process, selectedProcessId);
    onOpenProcess();
  }

  useEffect(() => {
    if (!isEmpty(userDetail)) {
      fetchProcedures(organization?.id);
    }
  }, [
    organization,
    params.toString(),
    persistedTab,
    isBasicUser,
    userDetail?.id,
    pageSize,
    search,
  ]);

  function triggerFetchProcessList() {
    fetchProcedures(organization?.id);
  }

  useEffect(() => {
    processStore.setCanUserEditInProcessList(userCanManage);
  }, [userCanManage]);

  useEffect(() => {
    if (isEmpty(userDetail)) return;

    userStore.getUsers({
      where: {
        organizationId: userDetail.organizationId,
        // authRoleId: { neq: AuthRoleIdEnum.BASIC_USER },
      },
      fields: [
        "id",
        "firstName",
        "lastName",
        "email",
        "username",
        "image",
        "organizationId",
      ],
    });
    processStore.setProcessesFilter({
      ...processStore.processesFilter,
      ...{
        creators: getValidArray([
          {
            label: getFullName(userDetail.firstName, userDetail.lastName),
            value: userDetail?.id,
          },
        ]),
      },
    });
  }, [userDetail?.id]);

  // if (!currentUser?.isEditor && isBasicUser) return null;

  return (
    <>
      <Row className={styles.container}>
        <div
          className={cx(styles.layout, {
            [styles.layoutDeActive]: !activeModal,
          })}
        >
          <ActionSheet
            isManageMode={isManageMode}
            refetch={(organizationId: string) => {
              fetchProcedures(organizationId);
              setSelectedProcessDraftList([]);
            }}
            onCreateProcess={handleCreateProcess}
          />
          {processStore.isFetchingList ? (
            <div className={styles.spinnerWrapper}>
              <GlobalSpinner />
            </div>
          ) : (
            <>
              {persistedTab === EDraftTab.PROCESS && (
                <ProcessTab
                  isManageMode={isManageMode}
                  activeTab={persistedTab}
                  onClickCard={handleOpenProcessModal}
                  handleChangeProcessItem={handleSelectProcess}
                  handleChangeAllProcessList={handleSelectAllProcess}
                  selectedProcessDraftList={selectedProcessDraftList}
                  setSelectedProcessDraftList={setSelectedProcessDraftList}
                  fetchProcessList={triggerFetchProcessList}
                />
              )}

              {/*persistedTab === EDraftTab.COLLECTION && (
              // <CollectionList
              // isDraft
              // isManageMode={isManageMode}
              // items={collections}
              // viewMode={ViewMode.List}
              // onItemClick={handleClickCollectionItem}
              // selectedId={selectedCollectionId}
              // gotoPage={gotoPage}
              // pageSize={pageSize}
              // sort={mapSortTitleToValue(sortField)}
              // />
            )*/}
              <CkPagination
                pagination={pagination}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </>
          )}
        </div>
        <ProcessSummary isOpen={isOpenProcess} onClose={onCloseProcess} />
        {/* <CollectionLoading visible={loading} />  */}
      </Row>
    </>
  );
};

export default observer(ProcessPage);
