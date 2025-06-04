import {
  Divider,
  HStack,
  IconButton,
  Tag,
  Text,
  Tooltip,
  VStack,
  chakra,
  useDisclosure,
} from "@chakra-ui/react";
// import { unshareProcesses } from "API/user";
import { unshareProcesses } from "API/user";
import ConfirmModal from "components/Chakra/ConfirmModal";
import CkTable, {
  EAlignEnum,
  IPagination,
  ITableHeader,
} from "components/CkTable";
import ProcessSummary from "components/Common/ProcessSummary";
import { processIcon } from "components/Icon";
import SearchInput from "components/SearchInput";
import SvgIcon from "components/SvgIcon";
import { filterUserDetail } from "components/UserDetailPage/utils";
import { useStores } from "hooks/useStores";
import { IProcessWithRelations } from "interfaces/process";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { getValidArray } from "utils/common";
import { getName } from "utils/user";
import ShareProcess from "../ShareProcess";

export const ProcessList = () => {
  const { userStore, processStore, organizationStore } = useStores();
  const { userDetail, userDetailProcesses, countDetailProcess } = userStore;
  const { groupMembers = [] } = userDetail;
  const groupIds = getValidArray(groupMembers).map(
    (groupMember) => groupMember?.groupId ?? ""
  );
  const { isManageModeInUserDetail } = userStore;
  const { organization } = organizationStore;
  const currentTheme = organization?.theme ?? {};

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageIndex = Number(params.get("processPage") || "1");

  const [selectedProcess, setSelectedProcess] =
    useState<IProcessWithRelations>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [unshareText, setUnshareText] = useState<React.ReactNode>();
  const {
    isOpen: isOpenProcess,
    onOpen: onOpenProcess,
    onClose: onCloseProcess,
  } = useDisclosure();
  const {
    isOpen: isOpenShareModal,
    onOpen: onOpenShareModal,
    onClose: onCloseShareModal,
  } = useDisclosure();
  const {
    isOpen: isOpenConFirmUnshareModal,
    onOpen: onOpenConFirmUnshareModal,
    onClose: onCloseConFirmUnshareModal,
  } = useDisclosure();
  const [processPagination, setProcessPagination] = useState<
    IProcessWithRelations[]
  >(getValidArray(userDetailProcesses));

  function getHeaderList(): ITableHeader[] {
    const headers: ITableHeader[] = [
      {
        Header: "",
        accessor: "icon",
        width: 20,
      },
      {
        Header: "Name",
        accessor: "name",
        align: EAlignEnum.LEFT,
      },
      {
        Header: "Created By",
        accessor: "createdBy",
        align: EAlignEnum.LEFT,
      },
      {
        Header: "Shared",
        accessor: "shared",
        align: EAlignEnum.LEFT,
      },
      {
        Header: "",
        accessor: "actions",
        align: EAlignEnum.RIGHT,
      },
    ];

    return headers;
  }

  function gotoPage(newPage: number): void {
    params.set("processPage", `${newPage}`);
    navigate(
      `${routes.users.userId.value(`${userDetail?.id}`)}?${params.toString()}`
    );
  }

  const pagination: IPagination = {
    gotoPage,
    pageIndex,
    tableLength: countDetailProcess,
  };

  function handleOpenProcessModal(process: IProcessWithRelations): void {
    processStore.setSelectedProcess(process);
    processStore.setSelectedProcessId(process?.id ?? 0);
    onOpenProcess();
  }

  async function handleUnshareProcess(): Promise<void> {
    try {
      if (userDetail?.id && selectedProcess?.id) {
        await unshareProcesses(userDetail?.id, selectedProcess?.id);
        toast.success("Unshare process successfully");
        onCloseConFirmUnshareModal();
      }
    } catch (error: any) {
      onCloseConFirmUnshareModal();
      toast.error("Unshare process failed");
    } finally {
      setTimeout(async () => {
        await userStore.getUserDetail(userDetail?.id ?? "", filterUserDetail);
        await fetchProcessesOfUserDetail(organization?.id);
      }, 1000);
    }
  }

  const dataInTable = getValidArray(processPagination).map(
    (userDetailProcess) => {
      const process = userDetailProcess as IProcessWithRelations;
      const sharedDirectProcessIds = getValidArray(
        userDetail?.userProcesses
      ).map((userProcess) => userProcess?.processId);

      const isSharedDirectly = sharedDirectProcessIds?.includes(
        String(process?.id)
      );
      const isSharedViaGroup = getValidArray(userDetailProcess?.groups)
        .map((group) => group?.id ?? group?._id ?? "")
        .some((groupId) => groupIds?.includes(groupId));
      const isShareBothDirectlyAndViaGroup =
        isSharedDirectly && (isSharedViaGroup || true);

      function getUnshareText(): void {
        if (isSharedViaGroup && isSharedDirectly) {
          setUnshareText(
            <Text
              color="gray.700"
              fontSize="16px"
              fontWeight={400}
              lineHeight={6}
            >
              This user still has access to{" "}
              <Text as="span" fontWeight={700}>
                {process?.name}
              </Text>{" "}
              due to their group's permissions.
            </Text>
          );
        } else {
          setUnshareText(
            <Text
              color="gray.700"
              fontSize="16px"
              fontWeight={400}
              lineHeight={6}
            >
              Are you sure you want unshare the collection{" "}
              <Text as="span" fontWeight={700}>
                {process?.name}
              </Text>{" "}
              with this User?
            </Text>
          );
        }
      }

      return {
        ...process,
        icon: <IconBuilder icon={processIcon} size={40} isActive />,
        name: (
          <Text
            onClick={() =>
              navigate(
                routes.processes.processId.value(String(process?.id ?? ""))
              )
            }
            _hover={{ color: currentTheme?.primaryColor ?? "primary.500" }}
          >
            {process?.name ?? ""}
          </Text>
        ),
        createdBy: (
          <HStack flex={1}>
            <chakra.div
              textOverflow="ellipsis"
              maxWidth="200px"
              whiteSpace="nowrap"
              overflow="hidden"
              color="#2d3748"
            >
              {getName(process?.creator)}
            </chakra.div>
          </HStack>
        ),
        shared: isShareBothDirectlyAndViaGroup ? (
          <HStack>
            <Tag
              variant="solid"
              background="gray.100"
              width="max-content"
              height="24px"
              color="gray.500"
              borderRadius="6px"
              fontSize="14px"
              paddingY={0.5}
              paddingX={2}
              boxShadow="inset 0 0 0px 1px #CBD5E0"
            >
              Via Group
            </Tag>
            <Tag
              variant="solid"
              background="gray.100"
              width="max-content"
              height="24px"
              color="gray.500"
              borderRadius="6px"
              fontSize="14px"
              paddingY={0.5}
              paddingX={2}
              boxShadow="inset 0 0 0px 1px #CBD5E0"
            >
              Directly
            </Tag>
          </HStack>
        ) : (
          <Tag
            variant="solid"
            background="gray.100"
            width="max-content"
            height="24px"
            color="gray.500"
            borderRadius="6px"
            fontSize="14px"
            paddingY={0.5}
            paddingX={2}
            boxShadow="inset 0 0 0px 1px #CBD5E0"
          >
            {isSharedDirectly
              ? "Directly"
              : isSharedViaGroup // *INFO: Always false because we don't have collection yet
              ? "Via Collection"
              : "Via Group"}
          </Tag>
        ),
        actions: (
          <chakra.div style={{ display: "inline-flex", alignItems: "center" }}>
            <Tooltip
              label="Quick view"
              height="36px"
              fontSize="14px"
              padding={2}
              background="gray.700"
              placement="top"
              color="white"
              hasArrow
              borderRadius="4px"
            >
              {/* <IconDetail
                style={{ cursor: "pointer" }} */}
              <IconButton
                variant="ghost"
                colorScheme="#F7FAFC"
                aria-label="Call Segun"
                border="none"
                icon={<SvgIcon size={16} iconName="ic_detail" />}
                _hover={{ background: "gray.100" }}
                onClick={() =>
                  handleOpenProcessModal(process as IProcessWithRelations)
                }
              />
            </Tooltip>
            {isManageModeInUserDetail && isSharedDirectly && (
              <Tooltip
                label="Unshare"
                height="36px"
                fontSize="14px"
                padding={2}
                background="gray.700"
                placement="top"
                color="white"
                hasArrow
                borderRadius="4px"
              >
                <IconButton
                  variant="ghost"
                  colorScheme="#F7FAFC"
                  aria-label="Call Segun"
                  border="none"
                  icon={<SvgIcon size={20} iconName="unshare" />}
                  _hover={{ background: "gray.100" }}
                  onClick={() => {
                    getUnshareText();
                    onOpenConFirmUnshareModal();
                    setSelectedProcess(process);
                  }}
                />
              </Tooltip>
            )}
          </chakra.div>
        ),
      };
    }
  );

  async function fetchProcessesOfUserDetail(organizationId?: string) {
    if (!!searchKeyword) {
      const filteredKeyWordGroups = getValidArray(userDetailProcesses).filter(
        (process) => {
          return process?.name
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase());
        }
      );
      setProcessPagination(filteredKeyWordGroups);
      return;
    }

    setProcessPagination(userDetailProcesses);
  }

  useEffect(() => {
    if (organization?.id) {
      fetchProcessesOfUserDetail(organization.id);
    }
  }, [organization?.id, userDetail.id, pageIndex, pageSize, searchKeyword]);

  useEffect(() => {
    setProcessPagination(userDetailProcesses);
  }, [userDetailProcesses]);

  const debounceSearchKeyword = debounce((searchText: string) => {
    setSearchKeyword(searchText);
  }, 500);

  return (
    <VStack spacing={4} alignItems="left">
      <HStack spacing={4} width="full" justifyContent="space-between">
        <SearchInput
          width={336}
          placeholder="Search process by name"
          onChange={(event) => debounceSearchKeyword(event.target.value)}
        />
        {/* <Button
          border={0}
          color="white"
          fontWeight={500}
          lineHeight={6}
          borderRadius={8}
          hidden={!isManageModeInUserDetail}
          onClick={onOpenShareModal}
          background={currentTheme?.primaryColor ?? primary500}
          _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
          _active={{ background: currentTheme?.primaryColor ?? primary500 }}
          leftIcon={<SvgIcon size={16} iconName="ic_share" color="white" />}
        >
          Share new process
        </Button> */}
      </HStack>

      <Divider borderBottomWidth={2} color="gray.200" opacity={1} />

      <CkTable
        headerList={getHeaderList()}
        tableData={dataInTable}
        pagination={pagination}
        pageSize={pageSize}
        setPageSize={setPageSize}
        spacingX={4}
        hasNoSort
      />
      <ProcessSummary isOpen={isOpenProcess} onClose={onCloseProcess} />
      <ShareProcess
        isOpen={isOpenShareModal}
        onClose={onCloseShareModal}
        afterShare={fetchProcessesOfUserDetail}
      />
      <ConfirmModal
        titleText="Unshare process?"
        bodyText={unshareText}
        confirmButtonText="Unshare"
        isOpen={isOpenConFirmUnshareModal}
        onClose={onCloseConFirmUnshareModal}
        onClickAccept={handleUnshareProcess}
      />
    </VStack>
  );
};

export default observer(ProcessList);
