import { observer } from 'mobx-react';
import { Route, Routes } from 'react-router-dom';
import DomainPage from 'pages/DomainPage';
import routes from 'routes';
import SignUpPage from 'pages/SignUpPage';
import { getSubdomain } from 'utils/domain';
import LandingPage from 'pages/LandingPage';

const PublicRoutes = () => {
  const subdomain = getSubdomain();

  if (subdomain === 'app') {
    return (
      <Routes>
        <Route path="/" element={<DomainPage />} />
        <Route path={routes.signUp.value} Component={SignUpPage} />
        <Route path="*" element={<div>Public 404</div>} />{' '}
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path={routes.signUp.value} Component={SignUpPage} />
      <Route path="*" element={<div>Public 404</div>} />{' '}
    </Routes>
  );
};

export default observer(PublicRoutes);
