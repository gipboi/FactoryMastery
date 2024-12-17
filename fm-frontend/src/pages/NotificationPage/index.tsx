import { useEffect, useState } from "react";
import { useStores } from "hooks/useStores";
import { IFilter } from "types/common";
import { INotificationWithRelations } from "interfaces/notification";
import styles from "./styles.module.scss";
import NotificationHeader from "./NotificationHeader";
import NotificationList from "./NotificationList";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import {
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import { Search2Icon } from "@chakra-ui/icons";
import { ReactComponent as SortIcon } from "../../assets/icons/sort.svg";
import { getNotificationPipeline } from "./utils";
import NotificationListFilterDialog from "./NotificationList/NotificationListFilterDialog";
import CkPagination from "components/CkPagination";
import { IPagination } from "components/Pagination";
import { observer } from "mobx-react";

const NotificationPage = () => {
  const { notificationStore, authStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();
  const { countAllNotifications: tableLength } = notificationStore;
  const params = new URLSearchParams(location.search);
  const pageIndex: number = Number(params.get("page")) || 1;
  const [pageSize, setPageSize] = useState<number>(20);
  const keyword = params.get("keyword") || "";
  const filterUserIds: string[] = params.get("users")
    ? params
        .get("users")
        ?.split(",")
        ?.map((id: string) => String(id)) ?? []
    : [];
  const filterSortBy: string = params.get("sortBy") ?? "";
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);

  function handleChangeKeyword(newKeyword: string) {
    params.set("keyword", `${newKeyword}`);
    params.set("page", "1");
    navigate(`${routes.notifications.value}?${params.toString()}`);
  }

  function gotoPage(newPage: number) {
    params.set("page", `${newPage}`);
    navigate(`${routes.notifications.value}?${params.toString()}`);
  }
  const debouncedChangeKeyword = debounce(handleChangeKeyword, 700);

  function fetchNotifications() {
    const pipeline = getNotificationPipeline(
      authStore?.userDetail?.id ?? "",
      keyword,
      pageSize * (pageIndex - 1),
      pageSize,
      filterUserIds,
      filterSortBy,
      false
    );
    const countPipeline = getNotificationPipeline(
      authStore?.userDetail?.id ?? "",
      keyword,
      pageSize * (pageIndex - 1),
      pageSize,
      filterUserIds,
      filterSortBy,
      true
    );

    if (authStore?.userDetail?.id) {
      notificationStore.fetchNotificationByAggregation(pipeline, countPipeline);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, [
    authStore?.userDetail?.id,
    pageSize,
    pageIndex,
    filterSortBy,
    params.toString(),
  ]);

  const pagination: IPagination = {
    pageIndex,
    tableLength,
    gotoPage,
  };

  return (
    <VStack spacing={6} height="full" padding={{ base: 0, md: 6 }}>
      <HStack
        flexDirection={{ base: "row" }}
        width="full"
        marginTop="0px !important"
        spacing={0}
        justifyContent="space-between"
      >
        <HStack width="full" spacing={4}>
          <InputGroup borderRadius="6px" background="white" width="auto">
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              type="search"
              placeholder="Search notifications by username or full name"
              width={{ base: "100%", md: "400px" }}
              onChange={(e) => {
                debouncedChangeKeyword(e?.currentTarget?.value ?? "");
              }}
            />
          </InputGroup>
          <Button
            style={{ marginLeft: 16 }}
            backgroundColor="white"
            gap={{ base: 0, md: 2 }}
            border="1px solid #E2E8F0"
            borderRadius="6px"
            cursor="pointer"
            padding={{ base: "10px", md: "16px" }}
            variant="solid"
            className={styles.button}
            onClick={() => setShowFilterDialog(!showFilterDialog)}
          >
            <SortIcon className={styles.icon} />
            <Text
              marginBottom="0"
              fontWeight={500}
              fontSize={{
                base: "0px",
                md: "16px",
              }}
              lineHeight="24px"
              color="gray.700"
            >
              Filter
            </Text>
          </Button>
        </HStack>
      </HStack>

      <Divider border="1px solid rgba(76, 77, 94, 0.1)" margin={0} />

      <div className={styles.listContainer}>
        <NotificationHeader />
        <NotificationList />
      </div>
      <div className={styles.spacing}>
        <CkPagination
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
      <NotificationListFilterDialog
        isOpen={showFilterDialog}
        toggle={() => setShowFilterDialog(!showFilterDialog)}
        onApplyFilter={() => setShowFilterDialog(false)}
      />
    </VStack>
  );
};

export default observer(NotificationPage);
