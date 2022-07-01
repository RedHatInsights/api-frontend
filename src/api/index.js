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

export const getSpec = (url, isGithub) => {
  const spec = instance.get(url);
  if (isGithub) {
    return spec.then(({ content }) => load(Buffer.from(content, 'base64')));
  }

  return spec;
};

export const isValidGithub = ({ owner, repo, content } = {}) => {
  return owner && repo && content;
};

export const oneApi = ({ name, version = 'v1', url: defaultUrl, github }) => {
  const url = isValidGithub(github)
    ? `https://api.github.com/repos/${github.owner}/${github.repo}/contents/${github.content}`
    : defaultUrl ?? generateUrl(name, versionMapper[name] || version);
  const spec = getSpec(url, isValidGithub(github));
  return spec.then((data) => ({
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
