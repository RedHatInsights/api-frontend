import React, { Fragment } from 'react';
import { Badge } from '@patternfly/react-core/dist/dynamic/components/Badge';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Link } from 'react-router-dom';
import {
  ICell,
  OnCheckChange,
  OnTreeRowCollapse,
  SortByDirection,
  cellWidth,
  nowrap,
  sortable,
} from '@patternfly/react-table';
import { EmptyTable } from '@redhat-cloud-services/frontend-components/EmptyTable';
import ExportIcon from '@patternfly/react-icons/dist/dynamic/icons/export-icon';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-square-alt-icon';
import { oneApi } from '../api';
import fileDownload from 'js-file-download';
import JSZip from 'jszip';
import flatten from 'lodash/flatten';
import { treeRow } from '@patternfly/react-table/';
import { BASENAME } from './const';
import { GitHubConfig, Row } from '../store/store';

const indexToKey = ['', 'title', 'appName', 'version']; // pf indexes from 1 not 0

export const columns = (
  onSetRows?: OnTreeRowCollapse,
  onRowSelected?: OnCheckChange
): (ICell | string)[] => [
  {
    title: 'Application name',
    transforms: [sortable],
    cellTransforms: [...(onSetRows ? [treeRow(onSetRows, onRowSelected)] : [])],
  } as ICell,
  { title: 'API endpoint', transforms: [nowrap, sortable, cellWidth(10)] },
  { title: 'API version', transforms: [nowrap, sortable, cellWidth(10)] },
  { title: 'Download', transforms: [cellWidth(10)] },
];
type QueryConfig = {
  readonly?: boolean;
};

const constructParams = (
  url: string,
  github?: GitHubConfig,
  config: QueryConfig = {}
) => {
  const params = new URLSearchParams();
  url && params.set('url', url);
  if (github) {
    params.set('github-owner', github.owner);
    params.set('github-repo', github.repo);
    params.set('github-content', github.path);
  }
  Object.entries(config).forEach(([key, value]) => {
    value && params.set(key, `${value}`);
  });
  return params.toString();
};

export const rowMapper = (
  title: string,
  versions: string[],
  url: string,
  github: GitHubConfig,
  selectedRows: { [rowName: string]: Row } = {},
  apiName: string,
  config: QueryConfig = {}
) => ({
  selected:
    selectedRows?.[title]?.isSelected ||
    selectedRows?.[`parent-${title}`]?.isSelected,
  cells: [
    {
      title: (
        <Fragment>
          {versions || url || github ? (
            <Link
              to={`${BASENAME}/${apiName}${
                versions && versions[0] && versions[0] !== 'v1'
                  ? `/${versions[0]}`
                  : ''
              }${
                url || github || Object.values(config).length > 0 ? '?' : ''
              }${constructParams(url, github, config)}`}
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </Fragment>
      ),
      value: title,
      props: {
        value: title,
        'data-position': 'title',
      },
    },
    versions
      ? `/api/${apiName}`
      : url
      ? {
          title: (
            <span className="ins-c-docs__url">
              {url.replace(/openapi$/, '').replace(/^http(?:s):\/\//, '')}
            </span>
          ),
          props: {
            colSpan: 2,
          },
          value: url,
        }
      : github
      ? {
          title: (
            <Fragment>
              <Button
                variant="link"
                isInline
                component="a"
                icon={<ExternalLinkSquareAltIcon />}
                target="_blank"
                rel="noopener noreferrer"
                iconPosition="right"
                href={`https://github.com/${github.owner}/${github.repo}`}
              >
                {github.owner}/{github.repo}
              </Button>
            </Fragment>
          ),
          props: {
            colSpan: 2,
          },
          value: github,
        }
      : '',
    ...(!url && !github
      ? [
          {
            title: (
              <Fragment>
                {versions?.map?.((version) => (
                  <Link key={version} to={`${BASENAME}/${apiName}/${version}`}>
                    <Badge>{version}</Badge>
                  </Link>
                ))}
              </Fragment>
            ),
            value: versions,
          },
        ]
      : []),
    {
      title: (
        <Button
          variant="plain"
          onClick={() => downloadFile(apiName, versions?.[0], url, github)}
          icon={<ExportIcon />}
        />
      ),
    },
  ],
});

export const emptyTable = [
  {
    cells: [
      {
        title: (
          <EmptyTable>
            <Bullseye>
              <EmptyState
                variant={EmptyStateVariant.full}
                titleText={'No matching rules found'}
              >
                <EmptyStateBody>
                  This filter criteria matches no rules. <br /> Try changing
                  your filter settings.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </EmptyTable>
        ),
        props: {
          colSpan: 4,
        },
      },
    ],
  },
];

export function sortRows(
  curr: Row,
  next: Row,
  key = 'title',
  isDesc?: boolean
) {
  const getSortKey = (obj: Row): keyof Row =>
    (key === 'appName' && obj.apiName ? 'apiName' : key) as keyof Row;
  return isDesc
    ? (next[getSortKey(next)] as string)?.localeCompare(
        // FIXME: Update types
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        curr[getSortKey(curr)],
        'en',
        {
          sensitivity: 'base',
        }
      )
    : (curr[getSortKey(curr)] as string)?.localeCompare(
        // FIXME: Update types
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        next[getSortKey(next)],
        'en',
        {
          sensitivity: 'base',
        }
      );
}

export function buildRows(
  sortBy: {
    direction?: SortByDirection;
    index?: number;
  },
  { page, perPage }: { page: number; perPage: number },
  rows: Row[],
  selectedRows: { [rowName: string]: Row } = {},
  openedRows: string[]
) {
  if (rows.length > 0) {
    let rowIndex = 0;
    return rows
      .sort((curr, next) =>
        sortRows(
          curr,
          next,
          indexToKey[sortBy.index ?? 0],
          sortBy.direction === SortByDirection.desc
        )
      )
      .slice((page - 1) * perPage, page * perPage)
      .map(({ frontend, title, appName, version, apiName, api }, index) => {
        const row = [
          {
            ...rowMapper(
              title,
              api.versions,
              api.url,
              api.github,
              selectedRows,
              apiName || appName,
              { readonly: api.readonly }
            ),
            ...(api.subItems && {
              isTreeOpen: openedRows?.includes?.(
                (frontend && frontend.title) || title
              ),
              subItems: api.subItems,
            }),
            noDetail: !version && !api.url && !api.github,
            posinset: index + 1,
          },
          ...(api.subItems
            ? Object.entries(api.subItems).map(
                (
                  [key, { title, versions, url, apiName, github, readonly }],
                  subItemIndex
                ) => {
                  return {
                    ...rowMapper(
                      title,
                      versions,
                      url,
                      github,
                      selectedRows,
                      apiName || key,
                      { readonly }
                    ),
                    treeParent: rowIndex,
                    posinset: subItemIndex + 1,
                  };
                }
              )
            : []),
        ];
        rowIndex =
          rowIndex + (api.subItems ? Object.keys(api.subItems).length + 1 : 1);
        return row;
      })
      .flat();
  }

  return emptyTable;
}

export function filterRows(row: Row, filter: string) {
  const restFilterValues = [
    row.frontend?.title,
    ...(row.frontend?.paths || []),
    // eslint-disable-next-line camelcase
    ...(row.frontend?.sub_apps?.reduce<string[]>(
      (acc, curr) => [...acc, curr.title, curr.id],
      []
    ) || []),
    row.api?.apiName,
  ].filter(Boolean);
  return (
    indexToKey.some(
      (key) =>
        row[key as keyof Row] &&
        (row[key as keyof Row] as string)
          .toLocaleLowerCase()
          .indexOf(filter.toLocaleLowerCase()) !== -1
    ) ||
    restFilterValues.some(
      (value) =>
        value?.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1
    )
  );
}

export function downloadFile(
  appName: string,
  appVersion: string,
  url: string,
  github?: GitHubConfig
) {
  oneApi({
    name: appName,
    version: appVersion,
    url,
    github: { ...github, content: github?.path },
  }).then((data) => {
    const dataInternal: Partial<typeof data> = { ...data };
    delete dataInternal.latest;
    delete dataInternal.name;
    fileDownload(JSON.stringify(dataInternal), `${appName}-openapi.json`);
  });
}

export function multiDownload(
  selectedRows: { [rowName: string]: Row } = {},
  onError: (message: string) => void
) {
  const zip = new JSZip();
  const allFiles = Object.values(selectedRows)
    .filter(({ isSelected }) => isSelected)
    .map(({ appName, version, apiName, subItems, url, github }) => {
      if (subItems) {
        return Object.entries(subItems).map(
          ([key, { versions, url, github }]) =>
            oneApi({ name: key, version: versions?.[0], url, github }).catch(
              () =>
                onError(
                  `API ${key} with version ${versions[0]} not found or broken.`
                )
            )
        );
      } else {
        return oneApi({ name: apiName || appName, version, url, github }).catch(
          () =>
            onError(
              `API ${
                apiName || appName
              } with version ${version} not found or broken.`
            )
        );
      }
    });

  Promise.all(flatten(allFiles)).then((files) => {
    if (files && files.length > 1) {
      files.map((item) => {
        if (item) {
          const { name, ...file } = (item as Partial<typeof item>) || {};
          if (name) {
            delete file.latest;
            zip.file(`${name}-openapi.json`, JSON.stringify(file));
          }
        }
      });
      zip
        .generateAsync({ type: 'blob' })
        .then((content) => fileDownload(content, `cloud-services-openapi.zip`));
    } else if (files && files.length === 1) {
      const { name, ...file } = files[0] || {};
      if (name) {
        // FIXME: Update types
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete file.latest;
        fileDownload(JSON.stringify(file), `${name}-openapi.json`);
      }
    }
  });
}
