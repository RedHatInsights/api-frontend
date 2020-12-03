import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';
import {
  notifications,
  notificationsMiddleware,
} from '@redhat-cloud-services/frontend-components-notifications';
import promiseMiddleware from 'redux-promise-middleware';
import { services, detail } from './reducers';
let registry;

export function init(...middleware) {
  if (registry) {
    throw new Error('store already initialized');
  }

  registry = new ReducerRegistry({}, [
    promiseMiddleware,
    notificationsMiddleware({
      errorDescriptionKey: ['detail', 'stack'],
    }),
    ...middleware.filter((item) => typeof item !== 'undefined'),
  ]);

  registry.register({ services, detail, notifications });

  //If you want to register all of your reducers, this is good place.
  /*
   *  registry.register({
   *    someName: (state, action) => ({...state})
   *  });
   */
  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}
