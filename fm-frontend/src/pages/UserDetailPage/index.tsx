import { VStack } from "@chakra-ui/react";
import { observer } from "mobx-react";
import UserDetailTab from "./components/UserDetailTab";

const UserDetailLayout = () => {
  return (
    <VStack>
      <UserDetailTab />
    </VStack>
  );
};

export default observer(UserDetailLayout);
