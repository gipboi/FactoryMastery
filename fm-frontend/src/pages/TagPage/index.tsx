import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { handleError } from "API";
import CkTable, { IPagination } from "components/CkTable";
import { DATE_FORMAT } from "constants/common/date";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { ITag } from "interfaces/tag";
import { ITheme } from "interfaces/theme";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import { primary } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import { getFullName } from "utils/user";
import { ReactComponent as EditButton } from "../../assets/icons/edit-button.svg";
import { ReactComponent as MoreButton } from "../../assets/icons/more-button.svg";
import { ReactComponent as IconTrashRed } from "../../assets/icons/trash-red.svg";
import DeleteModal from "./components/DeleteModal";
import DetailModal from "./components/DetailModal";
import { getHeaderList, getTagByAggregation } from "./utils";

const TagPage = () => {
  const { tagStore, spinnerStore, authStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const { userDetail } = authStore;
  const { tags, tagsLength: tableLength } = tagStore;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageIndex: number = Number(query.get("page")) || 1;
  const [keyword, setKeyword] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [sort, setSort] = useState<string>("createdAt");
  const [orderBy, setOrderBy] = useState<number>(-1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();
  const currentTheme: ITheme = organization?.theme ?? {};
  const changeName = useCallback(
    debounce((event: { target: { value: string } }) => {
      setKeyword(event?.target?.value ?? "");
      gotoPage(0);
    }, 1000),
    []
  );
  const pagination: IPagination = { pageIndex, tableLength, gotoPage };

  function gotoPage(newPage: number): void {
    query.set("page", `${newPage}`);
    navigate(`${routes.setting.tag.value}?${query.toString()}`);
  }

  function reloadData(): void {
    setKeyword("");
    gotoPage(0);
    fetchData();
  }

  async function fetchData(
    isReset: boolean = false,
    page: number = pageIndex
  ): Promise<void> {
    try {
      spinnerStore.showLoading();
      const sortOrder = { [sort]: orderBy };
      const pipeline = getTagByAggregation(
        userDetail?.organizationId ?? "",
        pageSize,
        isReset ? 0 : pageSize * (page - 1),
        keyword,
        false,
        sortOrder
      );
      const countPipeline = getTagByAggregation(
        userDetail?.organizationId ?? "",
        0,
        0,
        keyword,
        true,
        sortOrder
      );

      await tagStore.fetchCMSTagList(pipeline, countPipeline);
      spinnerStore.hideLoading();
    } catch (error: any) {
      handleError(
        error as Error,
        "components/pages/TagPage/index.tsx",
        "fetchData"
      );
    }
  }

  useEffect(() => {
    if (!isOpen && userDetail?.organizationId) {
      fetchData();
    }
  }, [
    keyword,
    pageSize,
    pageIndex,
    userDetail?.organizationId,
    isOpen,
    sort,
    orderBy,
  ]);

  const dataInTable = getValidArray<ITag>(tags).map((tag) => {
    function handleEdit(): void {
      tagStore.selectTag(tag?.id ?? "");
      onOpen();
    }
    const { firstName, lastName } = tag?.creator ?? {};
    const creatorName = getFullName(firstName, lastName);
    return {
      ...tag,
      name: tag?.name ?? "N/A",
      createdBy: creatorName.trim() || "N/A",
      createdAt: dayjs(tag?.createdAt).format(DATE_FORMAT),
      actions: (
        <HStack spacing={2} justifyContent="flex-end">
          <IconButton
            border="unset"
            boxShadow="unset"
            background="transparent"
            variant="ghost"
            aria-label="Call Segun"
            _hover={{ background: "gray.100" }}
            onClick={handleEdit}
            icon={<EditButton />}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              border="unset"
              boxShadow="unset"
              background="transparent"
              variant="ghost"
              _hover={{ background: "gray.100" }}
              aria-label="Options"
              icon={<MoreButton />}
            />
            <MenuList border="1px solid #e2e8f0">
              <MenuItem
                background="#FFF"
                border="unset"
                boxShadow="unset"
                icon={<IconTrashRed />}
                onClick={() => {
                  tagStore.selectTag(tag?.id ?? "");
                  onOpenDelete();
                }}
              >
                <Text
                  marginBottom="0"
                  color="red.500"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                >
                  Delete
                </Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      ),
    };
  });

  return (
    <VStack
      spacing={6}
      height="full"
      padding={{ base: 0, md: 6 }}
      paddingTop={0}
    >
      <HStack spacing={0} width="full" paddingTop={0}>
        <Box
          display={{ base: "flex", md: "none" }}
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            paddingY={2}
            paddingX={2}
            outline="unset"
            border="unset"
            color="white"
            background={currentTheme?.primaryColor ?? "primary.500"}
            _hover={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _focus={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            borderRadius="8px"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
            onClick={onOpen}
          >
            Create
          </Button>
        </Box>
      </HStack>
      <Stack
        flexDirection={{ base: "column", md: "row" }}
        width="full"
        spacing={0}
        justifyContent="space-between"
        marginTop="-24px"
      >
        <InputGroup borderRadius="6px" background="white" width="auto">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            type="search"
            placeholder="Search tag"
            onChange={changeName}
            width={{ base: "100%", md: "420px" }}
            _focus={{ borderColor: currentTheme?.primaryColor ?? primary }}
          />
        </InputGroup>
        <Box
          display={{ base: "none", md: "flex" }}
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            paddingY={2}
            paddingX={4}
            outline="unset"
            border="unset"
            color="white"
            gap={{ base: 0, md: 2 }}
            background={currentTheme?.primaryColor ?? "primary.500"}
            _hover={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _focus={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            borderRadius="8px"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
            onClick={onOpen}
          >
            <Flex height={6} alignItems="center">
              <AddIcon fontSize="12px" />
            </Flex>
            Create Tag
          </Button>
        </Box>
      </Stack>
      <Divider borderColor="gray.200" margin={0} />
      <Box width="full" paddingBottom={6}>
        <CkTable
          headerList={getHeaderList()}
          tableData={dataInTable}
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
          isManualSort
          setSort={setSort}
          setOrderBy={setOrderBy}
        />
      </Box>
      <DeleteModal
        reloadData={reloadData}
        onClose={onCloseDelete}
        isOpen={isOpenDelete}
        closeEditModal={onClose}
      />
      <DetailModal isOpen={isOpen} onClose={onClose} reloadData={reloadData} />
    </VStack>
  );
};

export default observer(TagPage);
