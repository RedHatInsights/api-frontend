import { LOAD_ALL, LOAD_ONE_API, SELECT_ROW } from './actionTypes';
import { activeApi, oneApi } from '../api';
import { GitHubConfig, Row } from './store';

export const onLoadApis = (isBeta: boolean, isProd: boolean) => ({
  type: LOAD_ALL,
  payload: activeApi(isBeta, isProd),
});

export const onLoadOneApi = (data: {
  name: string;
  version?: string;
  url?: string;
  github?: Partial<GitHubConfig>;
}) => ({
  type: LOAD_ONE_API,
  payload: oneApi(data),
});

export const onSelectRow = (data: {
  isSelected: boolean;
  row: Row[] | Row;
}) => ({
  type: SELECT_ROW,
  payload: data,
});
