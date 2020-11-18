/*global module*/

const SECTION = 'docs';
const APP_ID = 'api';
const FRONTEND_PORT = 8002;
const routes = {};

routes[`/beta/${SECTION}/${APP_ID}`] = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/docs-api`]       = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/apps/docs-api`]            = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/docs/api`]       = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/apps/docs/api`]            = { host: `https://localhost:${FRONTEND_PORT}` };

module.exports = { routes };
