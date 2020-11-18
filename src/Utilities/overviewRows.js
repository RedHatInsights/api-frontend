import React, { Fragment } from 'react';
import {
    Badge,
    Bullseye,
    Button,
    EmptyState,
    Title,
    EmptyStateBody,
    EmptyStateVariant
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { sortable, SortByDirection, cellWidth } from '@patternfly/react-table';
import { EmptyTable } from '@redhat-cloud-services/frontend-components';
import { ExportIcon } from '@patternfly/react-icons';
import { oneApi } from '../api';
import fileDownload from 'js-file-download';
import JSZip from 'jszip';
import flatten from 'lodash/flatten';
import { treeTable } from '@redhat-cloud-services/frontend-components/components/TreeTable';

const indexToKey = [ '', 'title', 'appName', 'version' ]; // pf indexes from 1 not 0

export const columns = (onSetRows) => [
    {
        title: 'Application name',
        transforms: [ sortable ],
        cellTransforms: [ treeTable(onSetRows) ]
    },
    { title: 'API endpoint', transforms: [ sortable ]},
    { title: 'API version', transforms: [ sortable, cellWidth(10) ]},
    { title: 'Download', transforms: [ cellWidth(10) ]}
];

export const rowMapper = (title, appName, version, selectedRows = [], apiName) => ({
    selected: selectedRows?.[appName]?.isSelected,
    cells: [
        {
            title: <Fragment>
                { version ? <Link to={ `/${apiName}` }>{ title }</Link> : title }
            </Fragment>,
            value: title,
            props: {
                value: title,
                'data-position': 'title'
            }
        },
        version ? `/api/${apiName}` : '',
        {
            title: <Badge>{ version }</Badge>,
            value: version
        },
        {
            title: <Button variant="plain" onClick={ () => downloadFile(apiName, version) }> <ExportIcon /> </Button>
        }
    ]}
);

export const emptyTable = [{
    cells: [{
        title: (<EmptyTable>
            <Bullseye>
                <EmptyState variant={ EmptyStateVariant.full }>
                    <Title headingLevel="h5" size="lg">
                        No matching rules found
                    </Title>
                    <EmptyStateBody>
                        This filter criteria matches no rules. <br /> Try changing your filter settings.
                    </EmptyStateBody>
                </EmptyState>
            </Bullseye>
        </EmptyTable>),
        props: {
            colSpan: columns.length
        }
    }]
}];

export function sortRows(curr, next, key = 'title', isDesc) {
    const getSortKey = (obj) => key === 'appName' && obj.apiName ? 'apiName' : key;
    return isDesc
        ? next[getSortKey(next)]?.localeCompare(curr[getSortKey(curr)], 'en', { sensitivity: 'base' })
        : curr[getSortKey(curr)]?.localeCompare(next[getSortKey(next)], 'en', { sensitivity: 'base' });
}

export function buildRows(sortBy, { page, perPage }, rows, selectedRows, openedRows) {
    if (rows.length > 0) {
        return rows
        .sort((curr, next) => sortRows(curr, next, indexToKey[sortBy.index], sortBy.direction === SortByDirection.desc))
        .slice((page - 1) * perPage, page * perPage).map(({ frontend, title, appName, version, apiName, api }, index) => ([
            {
                ...rowMapper(
                    title,
                    `${api.subItems ? 'parent-' : ''}${apiName || appName}`,
                    version,
                    selectedRows,
                    apiName || appName
                ),
                ...api.subItems && {
                    isTreeOpen: openedRows?.includes?.((frontend && frontend.title) || title),
                    subItems: api.subItems
                },
                noDetail: !version
            },
            ...api.subItems ? Object.entries(api.subItems).map(([ key, { title, versions, apiName }]) => ({
                ...rowMapper(title, apiName || key, versions?.[0], selectedRows, apiName || key),
                treeParent: index
            })) : []
        ])
        ).flat();
    }

    return emptyTable;
}

export function filterRows(row, filter) {
    return indexToKey.some(key => row[key] &&
        row[key].toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1
    );
}

export function downloadFile(appName, appVersion) {
    oneApi({ name: appName, version: appVersion })
    .then(data => {
        delete data.latest;
        delete data.name;
        fileDownload(JSON.stringify(data), `${appName}-openapi.json`);
    });
}

export function multiDownload(selectedRows = {}, onError) {
    const zip = new JSZip();
    const allFiles = Object.values(selectedRows)
    .filter(({ isSelected }) => isSelected)
    .map(({ appName, version, apiName, subItems }) => {
        if (subItems) {
            return Object.entries(subItems)
            .map(([ key, { versions }]) => (
                oneApi({ name: key, version: versions[0] })
                .catch(() => onError(`API ${key} with version ${versions[0]} not found or broken.`))
            ));
        } else {
            return oneApi({ name: apiName || appName, version })
            .catch(() => onError(`API ${apiName || appName} with version ${version} not found or broken.`));
        }
    });

    Promise.all(flatten(allFiles)).then(files => {
        if (files && files.length > 1) {
            files.map(({ name, ...file } = {}) => {
                if (name) {
                    delete file.latest;
                    zip.file(`${name}-openapi.json`, JSON.stringify(file));
                }
            });
            zip.generateAsync({ type: 'blob' })
            .then((content) => fileDownload(content, `cloud-services-openapi.zip`));
        } else if (files && files.length === 1) {
            const { name, ...file } = files[0] || {};
            if (name) {
                delete file.latest;
                fileDownload(JSON.stringify(file), `${name}-openapi.json`);
            }
        }
    });
}
