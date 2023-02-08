import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import PropTypes from 'prop-types';
import { usePrefetch } from '@scalprum/react-core';
import { onLoadApis } from './store/actions';

let registry;

function getRegistry() {
  if (!registry) {
    console.log('init call');
    registry = init();
  }

  return registry;
}

export const prefetch = async () => {
  const { dispatch, getState } = getRegistry().getStore();
  if (!getState().loaded) {
    return dispatch(onLoadApis());
  }
};

const AppEntry = () => {
  const { error, ready } = usePrefetch();

  useEffect(() => {
    return () => {
      registry = undefined;
    };
  }, []);

  if (!error && !ready) {
    return null;
  }
  // cannot be in a render as it will create multiple store instances during a render and a race condition when accessing the context
  return (
    <RegistryContext.Provider
      value={{
        getRegistry,
      }}
    >
      <Provider store={registry.getStore()}>
        <App />
      </Provider>
    </RegistryContext.Provider>
  );
};

AppEntry.propTypes = {
  isDev: PropTypes.bool,
};

export default AppEntry;
