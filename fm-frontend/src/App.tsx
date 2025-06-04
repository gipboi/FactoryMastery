import { Fragment, useEffect, useState } from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import { ChakraProvider } from "@chakra-ui/react";
import { Provider as MobxProvider, observer } from "mobx-react";
import { rootStore } from "stores";
import theme from "themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminRoutes from "Router/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicRoutes from "Router/PublicRoutes";
import SubDomainRoutes from "Router/SubDomainRoutes";
import { getSubdomain } from "utils/domain";
import { AuthenticateParams } from "constants/enums/auth";
import { primary500 } from "themes/globalStyles";
import GlobalSpinner from "components/GlobalSpinner";
import { SUPER_ADMIN_DOMAIN } from "constants/admin";

const App = observer(() => {
  const { authStore } = rootStore;
  const [loading, setLoading] = useState(false);
  const subDomain = getSubdomain();
  const isInSubdomain: boolean =
    !!subDomain && subDomain !== "app";
  const isInAdmin = subDomain && subDomain === SUPER_ADMIN_DOMAIN;
  const query = new URLSearchParams(window?.location?.search);
  const accessToken: string = query.get(AuthenticateParams.ACCESS_TOKEN) || "";

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    authStore.getMyUser();
    setLoading(true);
    // *INFO: If in subdomain need to verify the domain, or else have to redirect back to main page
    if (isInSubdomain) {
      rootStore.organizationStore
        .getOrganizationBySubdomain(subDomain)
        .then(() => setLoading(false))
        .catch(() => {
          const rootURL = window.location.href.replace(`${subDomain}.`, "");
          window.location.href = rootURL;
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      authStore.setAccessToken(accessToken);
      window.location.href = window.location.origin + window.location.pathname;
    }
  }, [accessToken]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--current-primary-color", primary500);
    root.style.setProperty('--current-secondary-color', primary500)
  }, []);

  return (    
    <Fragment>
      {loading ? (
        <GlobalSpinner />
      ) : (
        <BrowserRouter>
          <Routes>
            {isInAdmin && <Route path="*" element={<AdminRoutes />} />}
            {isInSubdomain && <Route path="*" element={<SubDomainRoutes />} />}
            {!isInAdmin && !isInSubdomain && (
              <Route path="*" element={<PublicRoutes />} />
            )}
            {/* Catch-all for 404 */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </BrowserRouter>
      )}
    </Fragment>
  );
});

const AppWithProviders = () => {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <MobxProvider {...rootStore}>
        <ChakraProvider theme={theme} resetCSS={false}>
          <App />
          <ToastContainer
            autoClose={3000}
            theme="colored"
            style={{
              zIndex: 999999,
            }}
          />
        </ChakraProvider>
      </MobxProvider>
    </ChakraProvider>
  );
};

export default AppWithProviders;
