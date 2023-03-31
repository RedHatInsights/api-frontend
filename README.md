[![Build Status](https://travis-ci.org/RedHatInsights/insights-frontend-starter-app.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-frontend-starter-app)

# Api docs

React.js application to show API documentations on single pane of glass. This application uses [RedHatInsights/cloud-services-config](https://github.com/RedHatInsights/cloud-services-config) to build the table and details based on API fields in `main.yml` file.

## Getting Started

There is a [comprehensive quick start guide in the Storybook Documentation](https://github.com/RedHatInsights/insights-frontend-storybook/blob/master/src/docs/welcome/quickStart/DOC.md) to setting up an Insights environment complete with:

- Insights Frontend Starter App

- [Insights Chroming](https://github.com/RedHatInsights/insights-chrome)
- [Insights Proxy](https://github.com/RedHatInsights/insights-proxy)

Note: You will need to set up the Insights environment if you want to develop with the starter app due to the consumption of the chroming service as well as setting up your global/app navigation through the API.

## Build app

1. ```npm install```

2. ```npm run start```
    - starts webpack bundler and serves the files with webpack dev server

### Testing

- `npm run verify` will run linters and tests
- Travis is used to test the build for this code.
  - You are always notified on failed builds
  - You are only notified on successful builds if the build before it failed
  - By default, both `push` events as well as `pull_request` events send notifications
  - Travis is defaulted to notify #insights-bots

## Deploying

- The Platform team is using Travis to deploy the application
  - The Platform team will help you set up the Travis instance if this is the route you are wanting to take

### How it works

- any push to the `{REPO}` `master` branch will deploy to a `{REPO}-build` `ci-beta` branch
- any push to the `{REPO}` `ci-stable` branch will deploy to a `{REPO}-build` `ci-stable` branch
- any push to the `{REPO}` `qa-beta` branch will deploy to a `{REPO}-build` `qa-beta` branch
- any push to the `{REPO}` `qa-stable` branch will deploy to a `{REPO}-build` `qa-stable` branch
- any push to the `{REPO}` `prod-beta` branch will deploy to a `{REPO}-build` `prod-beta` branch
- any push to the `{REPO}` `prod-stable` branch will deploy to a `{REPO}-build` `prod-stable` branch
- Pull requests (based on master) will not be pushed to `{REPO}-build` `master` branch
  - If the PR is accepted and merged, master will be rebuilt and will deploy to `{REPO}-build` `ci-beta` branch

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## Insights Components

Insights Platform will deliver components and static assets through [npm](https://www.npmjs.com/package/@red-hat-insights/insights-frontend-components). ESI tags are used to import the [chroming](https://github.com/RedHatInsights/insights-chrome) which takes care of the header, sidebar, and footer.

## Technologies

### Webpack

#### Webpack.config.js

This file exports an object with the configuration for webpack and webpack dev server.

```Javascript
{
    mode: https://webpack.js.org/concepts/mode/,
    devtool: https://webpack.js.org/configuration/devtool/,

    // different bundle options.
    // allows you to completely separate vendor code from app code and much more.
    // https://webpack.js.org/plugins/split-chunks-plugin/
    optimization: {
        chunks: https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks-chunks-all,
        runtimeChunk: https://webpack.js.org/plugins/split-chunks-plugin/#optimization-runtimechunk,

        // https://webpack.js.org/plugins/split-chunks-plugin/#configuring-cache-groups
        cacheGroups: {

            // bundles all vendor code needed to run the entry file
            common_initial: {
                test: // file regex: /[\\/]node_modules[\\/]/,
                name: // filename: 'common.initial',
                chunks: // chunk type initial, async, all
            }
        }
    },

    // each property of entry maps to the name of an entry file
    // https://webpack.js.org/concepts/entry-points/
    entry: {

        // example bunde names
        bundle1: 'src/entry1.js',
        bundle2: 'src/entry2.js'
    },

    // bundle output options.
    output: {
            filename: https://webpack.js.org/configuration/output/#output-filename,
            path: https://webpack.js.org/configuration/output/#output-path,
            publicPath: https://webpack.js.org/configuration/output/#output-publicpath,
            chunkFilename: https://webpack.js.org/configuration/output/#output-chunkfilename
    },
     module: {
         rules: https://webpack.js.org/configuration/module/#module-rules
     },

     // An array of webpack plugins look at webpack.plugins.js
     // https://webpack.js.org/plugins/
     plugins: [],

     // webpack dev serve options
     // https://github.com/webpack/webpack-dev-server
     devServer: {}
}
```

## Running locally
Have [insights-proxy](https://github.com/RedHatInsights/insights-proxy) installed under PROXY_PATH

#### a) using global config
```shell
SPANDX_CONFIG="./profiles/local-frontend.js" bash $PROXY_PATH/scripts/run.sh
```

#### b) using custom config
Follow guide on [RedHatInsights/cloud-services-config#testing-your-changes-locally](https://github.com/RedHatInsights/cloud-services-config#testing-your-changes-locally) to run your changes in `main.yml` config and run

```shell
SPANDX_CONFIG="./profiles/local-frontend-and-config.js" bash $PROXY_PATH/scripts/run.sh
```


### Testing - jest

When you want to test your code with unit tests please use `jest`, which is preconfigured in a way to colect codecoverage as well. If you want to see your coverage on server the travis config has been set in a way that it will send data to [codecov.io](https://codecov.io) the only thing you have to do is visit their website (register), enable your repository and add CODECOV_TOKEN to your travis web config (do not add it to .travis file, but trough [travis-ci.org](https://travis-ci.org/))


