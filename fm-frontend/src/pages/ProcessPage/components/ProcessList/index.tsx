/* eslint-disable max-lines */
import { Box, Button, chakra, Checkbox, HStack } from "@chakra-ui/react";
import { ReactComponent as IconArchive } from "assets/icons/archive.svg";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import { observer } from "mobx-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";
import routes from "routes";
import { EDraftTab } from "../../constants";
import ProcessCard from "./ProcessCard";

import styles from "./styles.module.scss";
import { getValidArray } from "utils/common";
import DeleteDialog from "components/DeleteDialog";
import { AuthRoleNameEnum } from "constants/user";
import { checkUserCanEditProcess } from "pages/ProcessPage/utils";
import { archiveProcessById } from "API/process";
interface IProcessList {
  onClickCard: (process: IProcessWithRelations) => void;
  activeTab: string;
  handleChangeProcessItem: (
    id: string,
    type: string,
    isToggle: boolean,
    process?: IProcessWithRelations
  ) => void;
  handleChangeAllProcessList: () => void;
  selectedProcessDraftList: string[];
  setSelectedProcessDraftList: Dispatch<SetStateAction<string[]>>;
  fetchProcessList: () => void;
  isManageMode?: boolean;
}

enum EDeleteProcessMode {
  ON = 1,
  OFF = 0,
}

const ProcessList = (props: IProcessList) => {
  const { processStore, authStore, groupStore } = useStores();
  const {
    onClickCard,
    activeTab,
    fetchProcessList,
    isManageMode,
    setSelectedProcessDraftList,
  } = props;
  const [archiveProcessId, setArchiveProcessId] = useState(
    EDeleteProcessMode.OFF
  );
  const { processes } = processStore;
  const { groupMembers } = groupStore;
  const isActiveDraftProcess: boolean =
    props.selectedProcessDraftList.length > 0;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  async function handleArchiveProcesses() {
    if (isActiveDraftProcess) {
      try {
        await Promise.all(
          [...getValidArray(props?.selectedProcessDraftList)].map((id) =>
            archiveProcessById(id)
          )
        );
        navigate(routes.processes.value);
        fetchProcessList();
        toast.success("Process archived successfully");
        setSelectedProcessDraftList([]);
      } catch (error: any) {
        toast.error("Archived process failed");
      } finally {
        setArchiveProcessId(EDeleteProcessMode.OFF);
      }
    }
  }

  return (
    <div>
      <Row className={styles.processContainer}>
        {activeTab === EDraftTab.PROCESS &&
        getValidArray(processes).filter((item) => item?.id).length > 0 ? (
          <>
            <Col md="12">
              <HStack
                justifyContent="space-between"
                borderRadius="8px"
                background="white"
                paddingX={4}
                paddingY={2}
                width="full"
                height="56px"
                marginBottom={3}
              >
                <HStack width="stretch">
                  <Box
                    w={4}
                    h={4}
                    marginRight={isManageMode ? "30px" : "unset"}
                  >
                    <Checkbox
                      isChecked={
                        props.selectedProcessDraftList.length > 0 &&
                        props.selectedProcessDraftList.length ===
                          processes.length
                      }
                      isIndeterminate={
                        props.selectedProcessDraftList.length > 0 &&
                        props.selectedProcessDraftList.length < processes.length
                      }
                      onChange={props.handleChangeAllProcessList}
                      hidden={!isManageMode}
                    ></Checkbox>
                  </Box>
                  <div className={styles.processName}>
                    <span>Name</span>
                  </div>
                  {!isMobile && (
                    <chakra.div className={styles.processName} paddingLeft={16}>
                      <span>Created By</span>
                    </chakra.div>
                  )}
                </HStack>
                <HStack width="120px">
                  {isActiveDraftProcess ? (
                    <Button
                      className={styles.buttonShare}
                      rightIcon={<IconArchive />}
                      variant="ghost"
                      color="gray.700"
                      fontSize="md"
                      lineHeight="7"
                      fontWeight={500}
                      boxShadow="none"
                      border="none"
                      background="white"
                      hidden={!isManageMode}
                      onClick={() => {
                        setArchiveProcessId(EDeleteProcessMode.ON);
                      }}
                    >
                      Archive
                    </Button>
                  ) : null}
                </HStack>
              </HStack>
            </Col>
            <Col md="12">
              {Array.isArray(processes) &&
                processes.map(
                  (process: IProcessWithRelations, index: number) => {
                    const processId: string = process?.id ?? "";
                    const isActive: boolean =
                      props.selectedProcessDraftList.indexOf(processId) !== -1;
                    const hasEditorPermission: boolean =
                      checkUserCanEditProcess(
                        authStore.userDetail?.id ?? "",
                        groupMembers,
                        process
                      );

                    const canEditProcess: boolean =
                      (isBasicUser &&
                        [process?.createdBy ?? ""].includes(
                          authStore.userDetail?.id ?? ""
                        )) ||
                      (isBasicUser && hasEditorPermission) ||
                      !isBasicUser;

                    return (
                      <ProcessCard
                        isManageMode={isManageMode}
                        key={index}
                        procedure={process}
                        onClick={() => onClickCard(process)}
                        isActive={isActive}
                        isDraft={true}
                        handleChangeProcessList={props.handleChangeProcessItem}
                        activeTab={activeTab}
                        isChecked={
                          canEditProcess &&
                          props.selectedProcessDraftList.includes(processId)
                        }
                        canEditProcess={canEditProcess}
                      />
                    );
                  }
                )}
            </Col>
          </>
        ) : (
          <></>
        )}
      </Row>
      <DeleteDialog
        title="Archive Processes?"
        isOpen={!!archiveProcessId}
        message="You can find archived items in the Archive page"
        toggle={() => setArchiveProcessId(0)}
        onDelete={handleArchiveProcesses}
        onCancel={() => setArchiveProcessId(0)}
        confirmText="Archive"
      />
    </div>
  );
};

export default observer(ProcessList);
