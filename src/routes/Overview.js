import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components/SkeletonTable';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  TreeRowWrapper,
  sizeCalculator,
} from '@redhat-cloud-services/frontend-components/TreeTable';
import { Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
} from '@patternfly/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { onLoadApis, onSelectRow } from '../store/actions';
import {
  filterRows,
  buildRows,
  columns,
  multiDownload,
} from '../Utilities/overviewRows';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const isNotSelected = ({ selectedRows }) => {
  return (
    !selectedRows ||
    Object.values(selectedRows || {})
      .map(({ isSelected }) => isSelected)
      .filter(Boolean).length === 0
  );
};

const Overview = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(onLoadApis());
  }, []);
  const loaded = useSelector(({ services: { loaded } }) => loaded);
  const selectedRows = useSelector(
    ({ services: { selectedRows } }) => selectedRows
  );
  const endpoints = useSelector(
    ({ services: { endpoints } }) => endpoints || []
  );
  const [openedRows, setOpenedRows] = useState([]);
  const [sortBy, onSortBy] = useState({});
  const [pageSettings, onPaginate] = useState({
    perPage: 50,
    page: 1,
  });
  const [filter, onChangeFilter] = useState('');
  const filtered = filter && endpoints.filter((row) => filterRows(row, filter));
  const rows = loaded
    ? buildRows(
        sortBy,
        pageSettings,
        filtered || endpoints,
        selectedRows,
        openedRows
      )
    : [];
  const onSetRows = (_e, { props: { value } }) => {
    if (openedRows.includes(value)) {
      setOpenedRows(() => openedRows.filter((opened) => opened !== value));
    } else {
      setOpenedRows(() => [...openedRows, value]);
    }
  };

  return (
    <React.Fragment>
      <PageHeader className="pf-m-light">
        <PageHeaderTitle title="API documentation" />
      </PageHeader>
      <Main className="ins-c-docs__api">
        <React.Fragment>
          <PrimaryToolbar
            filterConfig={{
              items: [
                {
                  label: 'Filter by application name',
                  type: 'text',
                  filterValues: {
                    id: 'filter-by-string',
                    key: 'filter-by-string',
                    placeholder: 'Filter by application name',
                    value: filter,
                    onChange: (_e, value) => {
                      onPaginate({
                        ...pageSettings,
                        page: 1,
                      });
                      onChangeFilter(value);
                    },
                    isDisabled: !loaded,
                  },
                },
              ],
            }}
            actionsConfig={{
              actions: [
                {
                  label: 'Download selected',
                  props: {
                    isDisabled: isNotSelected({ selectedRows }),
                    onClick: () =>
                      multiDownload(selectedRows, (error) =>
                        dispatch(
                          addNotification({
                            variant: 'danger',
                            title: 'Server error',
                            description: error,
                            dismissable: true,
                          })
                        )
                      ),
                  },
                },
              ],
            }}
            {...(loaded && {
              pagination: {
                ...pageSettings,
                itemCount: (filtered || endpoints).length,
                onSetPage: (_e, page) =>
                  onPaginate({
                    ...pageSettings,
                    page,
                  }),
                onPerPageSelect: (_event, perPage) =>
                  onPaginate({
                    ...pageSettings,
                    perPage,
                  }),
              },
            })}
            {...(filter.length > 0 && {
              activeFiltersConfig: {
                filters: [
                  {
                    name: filter,
                  },
                ],
                onDelete: () => {
                  onPaginate({
                    ...pageSettings,
                    page: 1,
                  });
                  onChangeFilter('');
                },
              },
            })}
          />
          {loaded ? (
            <Table
              className="pf-m-expandable pf-c-treeview"
              aria-label="Sortable Table"
              variant={TableVariant.compact}
              sortBy={sortBy}
              onSort={(_e, index, direction) => onSortBy({ index, direction })}
              cells={columns(onSetRows)}
              rows={sizeCalculator(rows)}
              rowWrapper={TreeRowWrapper}
              {...((filtered || endpoints).length > 0 && {
                onSelect: (_e, isSelected, rowKey) => {
                  if (rowKey === -1) {
                    dispatch(onSelectRow({ isSelected, row: rows }));
                  } else {
                    dispatch(onSelectRow({ isSelected, row: rows[rowKey] }));
                  }
                },
              })}
            >
              <TableHeader />
              <TableBody />
            </Table>
          ) : (
            <SkeletonTable columns={columns} rowSize={28} />
          )}
        </React.Fragment>
        <TableToolbar isFooter>
          {loaded ? (
            <Pagination
              variant="bottom"
              dropDirection="up"
              itemCount={(filtered || endpoints).length}
              perPage={pageSettings.perPage}
              page={pageSettings.page}
              onSetPage={(_e, page) =>
                onPaginate({
                  ...pageSettings,
                  page,
                })
              }
              onPerPageSelect={(_event, perPage) =>
                onPaginate({
                  ...pageSettings,
                  perPage,
                })
              }
            />
          ) : (
            `loading`
          )}
        </TableToolbar>
      </Main>
    </React.Fragment>
  );
};

export default Overview;
