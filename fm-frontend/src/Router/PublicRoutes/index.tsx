import { observer } from "mobx-react";
import { Route, Routes } from "react-router-dom";
import DomainPage from "pages/DomainPage";
import routes from "routes";
import SignUpPage from "pages/SignUpPage";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="" Component={DomainPage} />
      <Route path={routes.signUp.value} Component={SignUpPage} />
      <Route path="*" element={<div>Public 404</div>} /> {/* Public-specific 404 */}
    </Routes>
  );
};

export default observer(PublicRoutes);
