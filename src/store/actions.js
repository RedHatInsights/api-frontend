import { LOAD_ALL, LOAD_ONE_API, SELECT_ROW } from './actionTypes';
import { activeApi, oneApi } from '../api';

export const onLoadApis = (isBeta, isProd) => ({
  type: LOAD_ALL,
  payload: activeApi(isBeta, isProd),
});

export const onLoadOneApi = (data) => ({
  type: LOAD_ONE_API,
  payload: oneApi(data),
});

export const onSelectRow = (data) => ({
  type: SELECT_ROW,
  payload: data,
});
