import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/files/helpers';
import PropTypes from 'prop-types';

const AppEntry = ({ logger }) => {
  return (
    <Provider store={init(logger).getStore()}>
      <Router basename={getBaseName(window.location.pathname)}>
        <App />
      </Router>
    </Provider>
  );
};

AppEntry.propTypes = {
  logger: PropTypes.any,
};

export default AppEntry;
