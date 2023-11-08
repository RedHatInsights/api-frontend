import { DEFAULT_PREFIX, versionMapper } from './constants';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { load } from 'js-yaml';
import { GitHubConfig } from '../store/store';
export { default as instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const apiList = () => {
  return instance.get(`/${DEFAULT_PREFIX}`);
};

export const generateUrl = (appName: string, appVersion: string) =>
  `/${DEFAULT_PREFIX}/${appName}/${appVersion}/openapi.json`;

export const activeApi = (isBeta: boolean, isProd: boolean) =>
  instance
    .get<string, string>(
      `/api/chrome-service/v1/static/${isBeta ? 'beta' : 'stable'}/${
        isProd ? 'prod' : 'stage'
      }/main.yml`
    )
    .then((data) => load(data) as Record<string, any>)
    .then((data) => ({
      services: Object.keys(data)
        .filter((oneAppKey) => data[oneAppKey].api)
        .map((oneAppKey) => ({
          appName: oneAppKey,
          ...data[oneAppKey],
        })),
    }));

export const getSpec = (
  url: string,
  isGithub?: boolean
): Promise<Record<string, any>> => {
  const spec = instance.get<object, Record<string, any>>(url);
  if (isGithub) {
    return spec.then(
      ({ content }) =>
        // TODO: Check if works toString from buffer
        load(Buffer.from(content, 'base64').toString('utf-8')) as Promise<
          Record<string, any>
        >
    );
  }

  return spec;
};

export const isValidGithub = (
  item: Partial<GitHubConfig> = {}
): item is GitHubConfig => {
  return !!(item.owner && item.repo && item.content);
};

export const oneApi = ({
  name,
  version = 'v1',
  url: defaultUrl,
  github,
}: {
  name: string;
  version?: string;
  url?: string;
  github?: Partial<GitHubConfig>;
}) => {
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
