import { useStores } from 'hooks/useStores';
import { Route, Routes, useLocation } from 'react-router-dom';
import routes from 'routes';
import { AuthenticateParams } from 'constants/enums/auth';
import { AuthRoleNameEnum } from 'constants/user';
import { lazy, useEffect } from 'react';
import { toast } from 'react-toastify';
import VerticalLayout from 'components/Layouts/VerticalLayout';
import DashboardPage from 'pages/DashboardPage';
import LoginPage from 'pages/LoginPage';
import UserAdminPage from 'pages/UserAdminPage';
import CompanyDetailPage from 'pages/CompanyDetailPage';

const SuperAdminRoutes = () => {
  const location = useLocation();
  const { authStore, userStore } = useStores();
  const accessToken: string =
    localStorage.getItem(AuthenticateParams.ACCESS_TOKEN) ?? '';
  const isLoggedIn: boolean = !!accessToken;
  const pathName = location.pathname;
  const { currentUser } = userStore;
  const isSuperAdmin =
    authStore.userDetail?.authRole === AuthRoleNameEnum.SUPER_ADMIN;

  useEffect(() => {
    if (isLoggedIn && !isSuperAdmin) {
      toast.error('You are not allowed to access this page, redirecting back.');
      setTimeout(() => authStore.logout(), 3000);
    }
  }, [isSuperAdmin, currentUser, pathName]);

  if (isLoggedIn && isSuperAdmin) {
    return (
      <VerticalLayout>
        <Routes>
          <Route path={routes.dashboard.value} element={<DashboardPage />} />
          <Route path={routes.admins.value} element={<UserAdminPage />} />
          <Route
            path={`${routes.organizations.value}/:organizationId`}
            element={<CompanyDetailPage />}
          />
        </Routes>
      </VerticalLayout>
    );
  }

  return (
    <Routes>
      <Route path={routes.home.value} element={<LoginPage />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
