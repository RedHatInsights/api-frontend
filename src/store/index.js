import { createContext } from 'react';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import promiseMiddleware from 'redux-promise-middleware';
import { services, detail } from './reducers';

export const RegistryContext = createContext({
  getRegistry: () => {},
});

export function init(...middleware) {
  const registry = new ReducerRegistry({}, [
    promiseMiddleware,
    notificationsMiddleware({
      errorDescriptionKey: ['detail', 'stack'],
    }),
    ...middleware.filter((item) => typeof item !== 'undefined'),
  ]);

  registry.register({ services, detail, notifications: notificationsReducer });

  //If you want to register all of your reducers, this is good place.
  /*
   *  registry.register({
   *    someName: (state, action) => ({...state})
   *  });
   */
  return registry;
}
