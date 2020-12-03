import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, Fragment } from 'react';
const Overview = lazy(() =>
  import(/* webpackChunkName: "Overview" */ './routes/Overview')
);
const Detail = lazy(() =>
  import(/* webpackChunkName: "Detail" */ './routes/Detail')
);

const paths = {
  overview: '/',
  detail: '/:apiName',
};

export const Routes = () => {
  return (
    <Suspense fallback={<Fragment />}>
      <Switch>
        <Route exact path={paths.overview} component={Overview} />
        <Route exact path={paths.detail} component={Detail} />
        <Route component={Overview} />
      </Switch>
    </Suspense>
  );
};

Routes.propTypes = {
  childProps: PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }),
};
