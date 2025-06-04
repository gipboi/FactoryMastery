import { Stack, VStack } from '@chakra-ui/react';
import WelcomeMessage from 'pages/DashboardPage/components/WelcomeMessage';
import DraftView from './components/DraftView';
import FavoriteView from './components/FavoriteView';
import { checkIsSuperAdminPage } from 'utils/domain';
import CompanyReportPage from 'pages/CompanyReportPage';

const SuperAdminDashboard = () => {
  return (
    <VStack spacing={4} width="full" alignItems="flex-start">
      <Stack
        flexDirection={{ base: 'column', md: 'row' }}
        spacing={0}
        gap={4}
        width="full"
        alignItems="flex-start"
      >
        <CompanyReportPage />
      </Stack>
    </VStack>
  );
};

const DashboardPage = () => {
  const isAdminPage: boolean = checkIsSuperAdminPage();

  if (isAdminPage) {
    return <SuperAdminDashboard />;
  }

  return (
    <VStack spacing={4} width="full" alignItems="flex-start">
      <WelcomeMessage />
      {/* <RecentView /> */}
      <Stack
        flexDirection={{ base: 'column', md: 'row' }}
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
