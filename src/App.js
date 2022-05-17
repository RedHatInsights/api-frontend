import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { Routes } from './Routes';
import './App.scss';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const App = () => {
  const chrome = useChrome();
  useEffect(() => {
    if (chrome) {
      const { identifyApp } = chrome.init();
      identifyApp(CRC_APP_NAME);
    }
  }, [chrome]);

  return (
    <React.Fragment>
      <NotificationsPortal />
      <Routes />
    </React.Fragment>
  );
};

App.propTypes = {
  history: PropTypes.object,
};

export default App;
