import React, { useEffect } from 'react';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { Routes } from './Routes';
import './App.scss';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const App = () => {
  const { updateDocumentTitle } = useChrome();
  useEffect(() => {
    updateDocumentTitle('API Documentation | Hybrid Cloud Console', true);
  }, [updateDocumentTitle]);

  // eslint-disable-next-line no-console
  console.log("KONFLUX TEST")

  return (
    <React.Fragment>
      <NotificationsPortal />
      <Routes />
    </React.Fragment>
  );
};

export default App;
