import React, { useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import PropTypes from 'prop-types';
import logger from 'redux-logger';

const AppEntry = ({ isDev }) => {
  // cannot be in a render as it will create multiple store instances during a render and a race condition when accessing the context
  const registry = useRef(isDev ? init(logger) : init());
  return (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry.current,
      }}
    >
      <Provider store={registry.current.getStore()}>
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
