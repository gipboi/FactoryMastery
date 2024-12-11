import { Stack, VStack } from "@chakra-ui/react";
// import RecentView from "pages/DashboardPage/components/RecentView";
import WelcomeMessage from "pages/DashboardPage/components/WelcomeMessage";
import DraftView from "./components/DraftView";
import FavoriteView from "./components/FavoriteView";
import RecentView from "./components/RecentView";

const DashboardPage = () => {
  return (
    <VStack spacing={4} width="full" alignItems="flex-start">
      <WelcomeMessage />
      {/* <RecentView /> */}
      <Stack
        flexDirection={{ base: "column", md: "row" }}
        spacing={0}
        gap={4}
        width="full"
        alignItems="flex-start"
      >
        <FavoriteView />
        <DraftView />
      </Stack>
    </VStack>
  );
};

export default DashboardPage;
