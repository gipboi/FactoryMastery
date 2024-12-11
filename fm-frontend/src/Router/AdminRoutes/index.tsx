import { observer } from "mobx-react";
import { Routes, Route } from "react-router-dom";
import routes from "routes";
import { VStack } from "@chakra-ui/react";

const AdminRoutes = () => {
  return (
    <Routes>
      <VStack
        background="gray.100"
        padding={{ base: 4, lg: 6 }}
        minHeight="100vh"
      >
        {/* <Route path={routes.admin.value} Component={<></>} /> */}
      </VStack>
    </Routes>
  );
};

export default observer(AdminRoutes);
