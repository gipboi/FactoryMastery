import { ChevronRightIcon } from "@chakra-ui/icons";
import { HStack, Text } from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import routes from "routes";

function UserPageHeader() {
  const { groupStore } = useStores();
  const { groupDetail } = groupStore;
  const url = window.location.href ?? "";
  const match = url?.match(/groups\/(\d+)/);
  const groupId = match !== null ? match[1] : "0";
  const navigate = useNavigate();

  useEffect(() => {
    groupStore.getGroupDetail(groupId);
  }, [groupId]);

  return (
    <HStack>
      <Text
        color="primary.500"
        cursor="pointer"
        onClick={() => navigate(routes.groups.value)}
      >
        User Groups
      </Text>
      <ChevronRightIcon />
      <Text color="gray.700">{groupDetail?.name ?? ""}</Text>
    </HStack>
  );
}

export default observer(UserPageHeader);
