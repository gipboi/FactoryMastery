import VerticalLayout from "components/Layouts/VerticalLayout";
import { AuthenticateParams } from "constants/enums/auth";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import CollectionDetailPage from "pages/CollectionDetailPage";
import CollectionsPage from "pages/CollectionsPage";
import DashboardPage from "pages/DashboardPage";
import DocumentTypePage from "pages/DocumentTypePage";
import ForgotPasswordPage from "pages/ForgotPasswordPage";
import GroupPage from "pages/GroupPage";
import GroupUserPage from "pages/GroupUserPage";
import IconBuilderPage from "pages/IconBuilderPage";
import InboxPage from "pages/InboxPage";
import LoginPage from "pages/LoginPage";
import ProcessDetailPage from "pages/ProcessDetailPage";
import ProcessPage from "pages/ProcessPage";
import ResetPasswordPage from "pages/ResetPasswordPage";
import TagPage from "pages/TagPage";
import UserDetailPage from "pages/UserDetailPage";
import UserPage from "pages/UserPage";
import { lazy, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";

const NotificationPage = lazy(() => import("pages/NotificationPage"));

const SubDomainRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStore, userStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const accessToken: string =
    localStorage.getItem(AuthenticateParams.ACCESS_TOKEN) ?? "";
  const isLoggedIn: boolean = !!accessToken;
  const pathName = location.pathname;
  const { currentUser } = userStore;
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  useEffect(() => {
    if (!isBasicUser) return;

    if (
      pathName.includes(routes.setting.value) ||
      (!currentUser?.isReportTool &&
        pathName.includes(routes.report.organization.value))
    ) {
      navigate(routes.dashboard.value);
      toast.error("You are not allowed to access this page, redirecting back.");
      return;
    }

    if (
      pathName.includes(routes.collections.value) &&
      !organization?.isCollectionFeature
    ) {
      navigate(routes.dashboard.value);
      toast.error("You are not allowed to access this page, redirecting back.");
      return;
    }
  }, [isBasicUser, currentUser, pathName]);

  if (isLoggedIn) {
    return (
      <VerticalLayout>
        <Routes>
          <Route path={routes.dashboard.value} element={<DashboardPage />} />
          <Route path={routes.groups.value} element={<GroupPage />} />
          <Route path={routes.users.value} element={<UserPage />} />
          <Route path={routes.processes.value} element={<ProcessPage />} />
          <Route
            path={`${routes.processes.value}/:processId`}
            element={<ProcessDetailPage />}
          />
          <Route
            path={routes.setting.documentType.value}
            element={<DocumentTypePage />}
          />
          <Route path={routes.setting.tag.value} element={<TagPage />} />
          <Route
            path={`${routes.users.value}/:userId`}
            element={<UserDetailPage />}
          />
          <Route
            path={`${routes.groups.value}/:groupId`}
            element={<GroupUserPage />}
          />
          <Route
            path={routes.notifications.value}
            element={<NotificationPage />}
          />
          <Route
            path={routes.setting.iconBuilder.value}
            element={<IconBuilderPage />}
          />
          <Route
            path={routes.collections.value}
            element={<CollectionsPage />}
          />
          <Route
            path={`${routes.collections.value}/:collectionId`}
            element={<CollectionDetailPage />}
          />
          <Route path={routes.messages.value} element={<InboxPage />} />

          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </VerticalLayout>
    );
  }

  return (
    <Routes>
      <Route path={routes.home.value} element={<LoginPage />} />
      <Route path={routes.login.value} element={<LoginPage />} />
      <Route
        path={routes.forgotPassword.value}
        element={<ForgotPasswordPage />}
      />
      <Route
        path={routes.resetPassword.value}
        element={<ResetPasswordPage />}
      />
      <Route path="*" element={<LoginPage />} />
      <Route path={routes.groups.value} Component={GroupPage} />
    </Routes>
  );
};

export default observer(SubDomainRoutes);
