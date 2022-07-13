import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import PropTypes from 'prop-types';
import logger from 'redux-logger';

const AppEntry = ({ isDev }) => {
  const registry = isDev ? init(logger) : init();
  return (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry,
      }}
    >
      <Provider store={registry.getStore()}>
        <Router basename={getBaseName(window.location.pathname)}>
          <App />
        </Router>
      </Provider>
    </RegistryContext.Provider>
  );
};

AppEntry.propTypes = {
  isDev: PropTypes.bool,
};

export default AppEntry;
