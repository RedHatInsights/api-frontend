import { Route, Routes as DomRoutes } from 'react-router-dom';
import React, { lazy, Suspense, Fragment } from 'react';
const Overview = lazy(() =>
  import(/* webpackChunkName: "Overview" */ './routes/Overview')
);
const Detail = lazy(() =>
  import(/* webpackChunkName: "Detail" */ './routes/Detail')
);

const paths = {
  overview: '*',
  detail: ':apiName/*',
  detailVersioned: ':apiName/:version/*',
};

export const Routes = () => {
  return (
    <Suspense fallback={<Fragment />}>
      <DomRoutes>
        <Route path={paths.detail} element={<Detail />} />
        <Route path={paths.detailVersioned} element={<Detail />} />
        <Route path={paths.overview} element={<Overview />} />
      </DomRoutes>
    </Suspense>
  );
};
