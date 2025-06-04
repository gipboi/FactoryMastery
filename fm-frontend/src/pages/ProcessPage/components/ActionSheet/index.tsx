import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import cx from "classnames";
import SvgIcon from "components/SvgIcon";
// import MultipleDropdown from "components/Topbar/components/SearchPageHeader/components/MultipleDropdown";
// import { AuthRoleIdEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import debounce from "lodash/debounce";
import get from "lodash/get";
import { observer } from "mobx-react";
// import CreateModal from "pages/CollectionsPage/components/CreateModal";
import { ReactComponent as SortIcon } from "assets/icons/sort.svg";
import Dropdown from "components/Dropdown";
import { AuthRoleNameEnum } from "constants/user";
import { IAsyncSelectOption } from "interfaces/common";
import { IProcess } from "interfaces/process";
import { ITheme } from "interfaces/theme";
import { checkValidFilter, countFilter } from "pages/ProcessPage/utils";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row } from "reactstrap";
import routes from "routes";
import { UpdateBody } from "types/common";
import { IDropdown } from "types/common/select";
import { checkValidArray } from "utils/common";
import { draftSortByOptions, EDraftTab } from "../../constants";
import CreateProcessDraftDialog from "../CreateProcessDraftDialog";
import ProcessFilterDialog from "../ProcessFilterDialog";
import styles from "./styles.module.scss";
import useBreakPoint from "hooks/useBreakPoint";
import { EBreakPoint } from "constants/theme";

interface IActionSheetProps {
  onCreateProcess?: (request: UpdateBody<IProcess>) => void;
  refetch: (organizationId: string) => void;
  isManageMode?: boolean;
}

const ActionSheet = ({
  refetch,
  onCreateProcess = () => {},
  isManageMode,
}: IActionSheetProps) => {
  const {
    authStore,
    organizationStore,
    userStore,
    // collectionStore,
    processStore,
  } = useStores();
  const { userDetail } = authStore;
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const persistedTab = `${params.get("tab") || EDraftTab.PROCESS}` as EDraftTab;
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const isEditor = userStore?.currentUser?.isEditor;
  const canCreateProcess = !isBasicUser || isEditor;
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCreateProcessDraftDialog, setShowCreateProcessDraftDialog] =
    useState<boolean>(false);
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] =
    useState<boolean>(false);
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  const handleChange = useCallback(
    debounce((event: { target: { value: string } }) => {
      params.set("search", event?.target?.value ?? "");
      params.set("page", "1");
      navigate(`${routes.processes.value}?${params.toString()}`);
    }, 1000),
    [params]
  );

  function toggleFilterProcess() {
    params.set("tab", `${EDraftTab.PROCESS}`);
    params.set("page", "1");
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  function toggleFilterCollection() {
    params.set("tab", `${EDraftTab.COLLECTION}`);
    params.set("page", "1");
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  function changeFilterCreator(creators: IAsyncSelectOption<string>[]) {
    processStore.setProcessesFilter({
      ...processStore.processesFilter,
      creators,
    });
    params.set(
      "creatorIds",
      checkValidArray(creators)
        ? creators.map((creator) => creator.value).join(",")
        : ""
    );
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  function changeFilterSortOrder(sort: string) {
    processStore.setProcessesFilter({
      ...processStore.processesFilter,
      sort,
    });
    params.set("sortBy", sort ?? "");
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  function clearFilter() {
    processStore.setProcessesFilter({
      ...processStore.processesFilter,
      // collections: [],
      documentTypes: [],
      groups: [],
      tags: [],
    });
    params.delete("collectionIds");
    params.delete("documentTypeIds");
    params.delete("groupIds");
    params.delete("tagIds");
    navigate(`${routes.processes.value}?${params.toString()}`);
  }

  useEffect(() => {
    if (get(location, "state.showCreateProcessDraftDialog", false)) {
      setShowCreateProcessDraftDialog(
        get(location, "state.showCreateProcessDraftDialog", false)
      );
      navigate(location, { state: {}, replace: true });
    }
  }, [location?.state]);

  return (
    <Row className={styles.container}>
      <Col md="12" className={styles.layout}>
        <HStack
          justifyContent="space-between"
          width="full"
          marginTop={4}
          flexDirection={isMobile ? 'column' : 'row'}
          spacing={4}
        >
          <HStack width="full" spacing={4}>
            <HStack spacing={0} className={styles.viewModeGroup}>
              <Button
                height="32px"
                gap={{ base: 0, md: 2 }}
                padding={2.5}
                borderRadius="6px 0px 0px 6px"
                border="1px solid #E2E8F0"
                background={
                  persistedTab === EDraftTab.PROCESS ? "gray.600" : "white"
                }
                color={
                  persistedTab === EDraftTab.PROCESS ? "white" : "gray.700"
                }
                className={cx({
                  [styles.active]: persistedTab === EDraftTab.PROCESS,
                })}
                onClick={toggleFilterProcess}
                _focus={{ boxShadow: "none" }}
                fontWeight={"normal"}
                fontSize={{
                  base: "0px",
                  md: "16px",
                }}
              >
                <Flex height={4} alignItems="center">
                  <SvgIcon iconName="process" size={16} />
                </Flex>
                <Text fontSize="md" display={{ base: "none", xl: "block" }}>
                  Process
                </Text>
              </Button>
              <Button
                height="32px"
                borderRadius="0px 6px 6px 0px"
                gap={{ base: 0, md: 2 }}
                padding={2.5}
                disabled
                fontSize={{
                  base: "0px",
                  md: "16px",
                }}
                border="1px solid #E2E8F0"
                fontWeight={"normal"}
                background={
                  persistedTab === EDraftTab.COLLECTION ? "gray.600" : "white"
                }
                color={
                  persistedTab === EDraftTab.COLLECTION ? "white" : "gray.700"
                }
                className={cx({
                  [styles.active]: persistedTab === EDraftTab.COLLECTION,
                })}
                onClick={toggleFilterCollection}
                _focus={{ boxShadow: "none" }}
              >
                <Flex height={4} alignItems="center">
                  <SvgIcon iconName="process" size={16} />
                </Flex>
                <Text fontSize="md" display={{ base: "none", xl: "block" }}>
                  Collection
                </Text>
              </Button>
            </HStack>
            <InputGroup
              height="32px"
              borderRadius="6px"
              maxWidth={{ base: "200px", xl: "336px" }}
              background="white"
              display={{ md: "block" }}
            >
              <InputLeftElement height="32px" pointerEvents="none">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                height="32px"
                fontSize="sm"
                type="search"
                placeholder="Search draft"
                onChange={handleChange}
              />
            </InputGroup>
            {/* <MultipleDropdown
              width={{ base: "full", md: "200px" }}
              name="creators"
              items={getValidArray(processStore.processesFilter.creators)}
              options={getUserOptions(userStore.users)}
              setItems={changeFilterCreator}
              placeHolder="Created by"
              isDisabled={false}
            /> */}
            <Button
              height="32px"
              backgroundColor="white"
              gap={{ base: 0, md: 2 }}
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
              padding={{ base: "10px" }}
              variant="solid"
              onClick={() => setShowFilterDialog(true)}
            >
              <Flex height={4} alignItems="center">
                <SortIcon className={styles.icon} />
              </Flex>
              <Text
                marginBottom="0"
                fontWeight={500}
                fontSize="sm"
                display={{ base: "none", xl: "block" }}
                lineHeight="24px"
                color="gray.700"
              >
                {`More Filters ${
                  countFilter(processStore.processesFilter)
                    ? `(${countFilter(processStore.processesFilter)})`
                    : ""
                }`}
              </Text>
            </Button>
            <Text
              color="gray.700"
              fontSize="14px"
              fontWeight={500}
              lineHeight={2}
              cursor="pointer"
              onClick={clearFilter}
              hidden={!checkValidFilter(processStore.processesFilter)}
            >
              Clear filters
            </Text>
          </HStack>
          <HStack spacing={{ base: 2, md: 4 }} width="fit-content">
            <Dropdown
              name="sort"
              titleDropdown="SORT BY"
              fontSize="sm"
              width="160px"
              height="32px"
              options={draftSortByOptions}
              item={{
                title: processStore.processesFilter.sort
                  ? `${processStore.processesFilter.sort}`
                  : "Last Updated",
                value: processStore.processesFilter.sort
                  ? `${processStore.processesFilter.sort}`
                  : "Last Updated",
              }}
              setValue={(name: string, dropdownValue: IDropdown) =>
                changeFilterSortOrder(`${dropdownValue.value}`)
              }
            />
            {canCreateProcess && isManageMode && (
              <Button
                variant="primary"
                height="32px"
                fontSize="sm"
                onClick={() =>
                  persistedTab === EDraftTab.PROCESS
                    ? setShowCreateProcessDraftDialog(true)
                    : setShowCreateCollectionDialog(true)
                }
                gap={{ base: 0, md: 2 }}
                padding={{ base: "10px", md: "16px" }}
                fontWeight={"normal"}
                background={currentTheme?.primaryColor ?? "primary.500"}
                _hover={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _focus={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
              >
                <Flex height={6} alignItems="center">
                  <AddIcon fontSize="12px" />
                </Flex>
                {!isMobile ? 'Create draft' : ''}
              </Button>
            )}
          </HStack>
        </HStack>
      </Col>
      <ProcessFilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(!showFilterDialog)}
      />
      <CreateProcessDraftDialog
        refetch={refetch}
        onClose={() =>
          setShowCreateProcessDraftDialog(!showCreateProcessDraftDialog)
        }
        isOpen={showCreateProcessDraftDialog}
        onSubmitProcess={onCreateProcess}
      />
      {/* <CreateModal
        isDraft
        isOpen={showCreateCollectionDialog}
        onClose={() => {
          setShowCreateCollectionDialog(false);
        }}
        // TODO: Update filter fetch draft collection (use isDraft)
        reloadData={() =>
          collectionStore.fetchCollectionsByFilter({ isPublished: false }, true)
        }
      /> */}
    </Row>
  );
};

export default observer(ActionSheet);
