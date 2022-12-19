import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
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
        <App />
      </Provider>
    </RegistryContext.Provider>
  );
};

AppEntry.propTypes = {
  isDev: PropTypes.bool,
};

export default AppEntry;
