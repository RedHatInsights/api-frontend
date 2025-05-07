import React, { useEffect } from 'react';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { Routes } from './Routes';
import './App.scss';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const App = () => {
  const { updateDocumentTitle } = useChrome();
  useEffect(() => {
    updateDocumentTitle('API Documentation | Hybrid Cloud Console', true);
  }, [updateDocumentTitle]);

  return (
    <React.Fragment>
      <NotificationsProvider />
      <Routes />
    </React.Fragment>
  );
};

export default App;
