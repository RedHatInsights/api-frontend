import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components/SkeletonTable';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { Pagination } from '@patternfly/react-core/dist/dynamic/components/Pagination';
import {
  OnTreeRowCollapse,
  SortByDirection,
  TableVariant,
} from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import { useDispatch, useSelector } from 'react-redux';
import { onLoadApis, onSelectRow } from '../store/actions';
import {
  buildRows,
  columns,
  filterRows,
  multiDownload,
} from '../Utilities/overviewRows';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { ReduxState, Row } from '../store/store';

const isRow = (row: any): row is Row => row?.cells[0]?.value !== undefined;

const isNotSelected = ({
  selectedRows,
}: {
  selectedRows: Record<string, Row>;
}) => {
  return (
    !selectedRows ||
    Object.values(selectedRows || {})
      .map(({ isSelected }) => isSelected)
      .filter(Boolean).length === 0
  );
};

const checkChildrenSelection = (
  selectedRows: Record<string, Row>,
  subItems: Row['subItems'],
  checkAll = false
) => {
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
  const { isBeta, isProd } = useChrome();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(onLoadApis(isBeta(), isProd()));
  }, []);
  const loaded = useSelector(({ services: { loaded } }: ReduxState) => loaded);
  const selectedRows = useSelector(
    ({ services: { selectedRows } }: ReduxState) => selectedRows
  );
  const endpoints = useSelector(
    ({ services: { endpoints } }: ReduxState) => endpoints || []
  );
  const [openedRows, setOpenedRows] = useState<string[]>([]);
  const [sortBy, onSortBy] = useState<{
    direction?: SortByDirection;
    index?: number;
  }>({});
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
  const onSetRows: OnTreeRowCollapse = (
    _e,
    _index,
    _item,
    { props: { value } }
  ) => {
    if (openedRows.includes(value)) {
      setOpenedRows(() => openedRows.filter((opened) => opened !== value));
    } else {
      setOpenedRows(() => [...openedRows, value]);
    }
  };

  const calculatedRows = rows.map((item) => {
    const value = isRow(item) ? item.cells[0]?.value : undefined;
    const props: {
      isChecked?: boolean | null;
      isExpanded?: boolean;
      value?: string;
      'aria-setsize'?: number;
      'aria-posinset'?: number;
      'aria-level'?: number;
      isHidden?: boolean;
    } = {
      isChecked: isRow(item) ? item.selected : false,
      isExpanded: openedRows.includes(value!),
      value: value,
      'aria-setsize': isRow(item) ? Object.keys(item.subItems || {}).length : 0,
      'aria-posinset': isRow(item) ? item.posinset : 0,
      'aria-level': 1,
    };

    if (
      isRow(item) &&
      Object.prototype.hasOwnProperty.call(item, 'treeParent')
    ) {
      const parent = rows[item.treeParent!];
      props['aria-level'] = 2;
      props.isHidden = isRow(parent)
        ? !openedRows.includes(parent?.cells?.[0]?.value)
        : false;
      props.isChecked = item.selected || (parent as unknown as Row).selected;
    }
    if (
      isRow(item) &&
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
                    page: 1,
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
                const currRow = calculatedRows[rowKey] as unknown as Row;
                if (
                  !isSelected &&
                  Object.prototype.hasOwnProperty.call(currRow, 'subItems')
                ) {
                  dispatch(
                    onSelectRow({
                      isSelected,
                      row: (
                        calculatedRows as unknown as (Row & {
                          props: { value: string };
                        })[]
                      ).filter(({ props: { value } }) =>
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
            <SkeletonTable
              columns={[
                'Application name',
                'API endpoints',
                'API version',
                'Download',
              ]}
              numberOfColumns={28}
            />
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
                  page: 1,
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
