import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components/SkeletonTable';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
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

const checkChildrenSelection = (selectedRows, subItems, checkAll = false) => {
  if (checkAll && Object.keys(selectedRows).length !== 0) {
    return Object.values(subItems).every?.(({ title }) =>
      Object.entries(selectedRows).find(
        ([key, { isSelected }]) => title === key && isSelected
      )
    );
  }
  return Object.values(subItems).some?.(({ title }) =>
    Object.entries(selectedRows).find(
      ([key, { isSelected }]) => title === key && isSelected
    )
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
  const onSetRows = (_e, _index, _item, { props: { value } }) => {
    if (openedRows.includes(value)) {
      setOpenedRows(() => openedRows.filter((opened) => opened !== value));
    } else {
      setOpenedRows(() => [...openedRows, value]);
    }
  };

  const calculatedRows = rows.map((item) => {
    const value = item.cells[0]?.value;
    const props = {
      isChecked: item.selected,
      isExpanded: openedRows.includes(value),
      value: value,
      'aria-setsize': Object.keys(item.subItems || {}).length,
      'aria-posinset': item.posinset,
      'aria-level': 1,
    };

    if (Object.prototype.hasOwnProperty.call(item, 'treeParent')) {
      const parent = rows[item.treeParent];
      props['aria-level'] = 2;
      props.isHidden = !openedRows.includes(parent?.cells?.[0]?.value);
      props.isChecked = item.selected || parent.selected;
    }
    if (
      !item.selected &&
      Object.prototype.hasOwnProperty.call(item, 'subItems')
    ) {
      if (checkChildrenSelection(selectedRows, item.subItems, true)) {
        props.isChecked = true;
      } else if (checkChildrenSelection(selectedRows, item.subItems)) {
        props.isChecked = null;
      }
    }

    return {
      ...item,
      props,
    };
  });

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
              isTreeTable
              className="pf-m-expandable pf-c-treeview"
              aria-label="Sortable Table"
              canSelectAll={false}
              variant={TableVariant.compact}
              sortBy={sortBy}
              onSort={(_e, index, direction) => onSortBy({ index, direction })}
              cells={columns(onSetRows, (_e, isSelected, rowKey) => {
                const currRow = calculatedRows[rowKey];
                if (
                  !isSelected &&
                  Object.prototype.hasOwnProperty.call(currRow, 'subItems')
                ) {
                  dispatch(
                    onSelectRow({
                      isSelected,
                      row: calculatedRows.filter(({ props: { value } }) =>
                        Object.values(currRow.subItems).find(
                          ({ title }) => title === value
                        )
                      ),
                    })
                  );
                }
                dispatch(onSelectRow({ isSelected, row: currRow }));
              })}
              rows={calculatedRows}
            >
              <TableHeader />
              <TableBody />
            </Table>
          ) : (
            <SkeletonTable columns={columns()} rowSize={28} />
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
