import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import * as ACTIONS from './actionTypes';
import { versionMapper } from '../api/constants';
import { Row, Service, ServicesState } from './store';

const defaultState = { loaded: false, selectedRows: {} };
const disabledApis = [
  'automation-analytics',
  'openshift',
  'ruledev',
  'acs',
  'app-studio-docs',
];

const getAppName = (service: Service) =>
  (service.api.alias && service.api.alias[0]) || service.appName;

function dataLoaded(
  state: ServicesState,
  {
    payload,
  }: {
    payload: {
      services: Service[];
    };
  }
) {
  return {
    ...state,
    endpoints:
      payload &&
      payload.services
        .filter(
          (service) =>
            !disabledApis.includes(service.appName) &&
            // eslint-disable-next-line rulesdir/no-chrome-api-call-from-window
            (!service.api.isBeta || window.insights.chrome.isBeta())
        )
        .map((service) => ({
          ...service,
          version:
            versionMapper[getAppName(service)] || service?.api?.versions?.[0],
          appName: getAppName(service),
          apiName: service.api.apiName,
        })),
    loaded: true,
  };
}

function detailLoaded(
  state: ServicesState,
  {
    payload: { latest, ...payload },
  }: {
    payload: Record<string, unknown> & {
      latest: boolean;
    };
  }
) {
  return {
    ...state,
    spec: payload,
    latest,
    loaded: true,
  };
}

function onSelectRow(
  state: ServicesState,
  {
    payload: { isSelected, row },
  }: {
    payload: {
      isSelected: boolean;
      row: Row;
    };
  }
) {
  const selectedRows = {
    ...(state.selectedRows || {}),
    ...(Array.isArray(row)
      ? row.reduce(
          (acc, curr) => ({
            ...acc,
            [`${row.subItems ? 'parent-' : ''}${curr.cells[0].value}`]: {
              isSelected,
              appName: curr.cells[0].value,
              url: curr.cells[1].value,
              version: curr.cells[2].value,
              ...(curr.subItems && {
                subItems: curr.subItems,
              }),
            },
          }),
          {}
        )
      : {
          [`${row.subItems ? 'parent-' : ''}${row.cells[0].value}`]: {
            isSelected,
            appName: row.cells[0].value,
            url: row.cells[1].value,
            version: row.cells[2].value,
            ...(row.subItems && {
              subItems: row.subItems,
            }),
          },
        }),
  };

  return {
    ...state,
    selectedRows,
  };
}

export const services = applyReducerHash(
  {
    [`${ACTIONS.LOAD_ALL}_FULFILLED`]: dataLoaded,
    [`${ACTIONS.LOAD_ALL}_PENDING`]: () => defaultState,
    [ACTIONS.SELECT_ROW]: onSelectRow,
  },
  defaultState
);

export const detail = applyReducerHash(
  {
    [`${ACTIONS.LOAD_ONE_API}_FULFILLED`]: detailLoaded,
    [`${ACTIONS.LOAD_ONE_API}_PENDING`]: () => ({ loaded: false }),
    [`${ACTIONS.LOAD_ONE_API}_REJECTED`]: () => ({ loaded: true, error: true }),
  },
  defaultState
);
