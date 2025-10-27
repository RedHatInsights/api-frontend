import { createContext } from 'react';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import promiseMiddleware from 'redux-promise-middleware';
import { detail, services } from './reducers';
import { Middleware } from 'redux';

export const RegistryContext = createContext({
  getRegistry: () => {},
});

export function init(...middleware: Middleware<any, any, any>[]) {
  const registry = new ReducerRegistry({}, [
    promiseMiddleware,
    ...middleware.filter((item) => typeof item !== 'undefined'),
  ] as Middleware[]);

  registry.register({
    services,
    detail,
  });

  //If you want to register all of your reducers, this is good place.
  /*
   *  registry.register({
   *    someName: (state, action) => ({...state})
   *  });
   */
  return registry;
}
