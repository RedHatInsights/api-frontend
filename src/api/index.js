import { versionMapper, DEFAULT_PREFIX } from './constants';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { load } from 'js-yaml';
export { default as instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const apiList = () => {
  return instance.get(`/${DEFAULT_PREFIX}`);
};

export const generateUrl = (appName, appVersion) =>
  `/${DEFAULT_PREFIX}/${appName}/${appVersion}/openapi.json`;

export const activeApi = () =>
  instance
    .get(`${insights.chrome.isBeta() ? '/beta' : ''}/config/main.yml`)
    .then((data) => load(data))
    .then((data) => ({
      services: Object.keys(data)
        .filter((oneAppKey) => data[oneAppKey].api)
        .map((oneAppKey) => ({
          appName: oneAppKey,
          ...data[oneAppKey],
        })),
    }));

export const oneApi = ({ name, version = 'v1', url: defaultUrl }) => {
  const url = defaultUrl ?? generateUrl(name, versionMapper[name] || version);
  return instance.get(url).then((data) => ({
    ...data,
    latest: url,
    name,
    servers: [
      ...(data.servers || []),
      { url: `/api/${name}/${versionMapper[name] || version}` },
    ]
      .filter(
        (server, key, array) =>
          array.findIndex(
            ({ url }) =>
              `${location.origin}${server.url}`.indexOf(url) === 0 ||
              server.url.indexOf(url) === 0
          ) === key
      )
      .map((server) => ({
        ...server,
        url:
          server.url.indexOf('/') === 0
            ? `${location.origin}${server.url}`
            : server.url,
      })),
  }));
};
