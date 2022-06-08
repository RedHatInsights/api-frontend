import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { onLoadOneApi } from '../store/actions';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import { Facebook } from 'react-content-loader';
import {
  CardBody,
  Card,
  Breadcrumb,
  BreadcrumbItem,
  Modal,
  Button,
  Level,
  LevelItem,
  ButtonVariant,
  Split,
  SplitItem,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import ReactJson from 'react-json-view';
import { useQuery } from '../Utilities/hooks';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const Detail = ({ loadApi, detail }) => {
  const { apiName, version = 'v1' } = useParams();
  const query = useQuery();
  const { auth } = useChrome();
  useEffect(() => {
    loadApi(apiName, version, query.get('url'), {
      owner: query.get('github-owner'),
      repo: query.get('github-repo'),
      content: query.get('github-content'),
    });
  }, []);

  const requestInterceptor = useCallback(
    async (req) => {
      req.headers = {
        ...(req.headers || {}),
        Authorization: `Bearer ${await auth.getToken()}`,
      };
      return req;
    },
    [auth]
  );

  const [isOpen, onModalToggle] = useState(false);

  return (
    <React.Fragment>
      <PageHeader className="pf-m-light">
        <PageHeaderTitle
          title={
            <React.Fragment>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link to="/">Overview</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{apiName}</BreadcrumbItem>
              </Breadcrumb>
              <React.Fragment>
                {detail.loaded && !detail.error && (
                  <Level className="ins-c-docs__api-detail">
                    <LevelItem className="ins-c-docs__api-detail-info">
                      {detail.loaded ? (
                        `Detail of ${detail.spec?.info?.title}`
                      ) : (
                        <Skeleton size={SkeletonSize.md} />
                      )}
                    </LevelItem>
                    <LevelItem>
                      <Split hasGutter>
                        <SplitItem className="ins-c-docs__api-detail-info">
                          {detail.loaded && !detail.error ? (
                            <TextContent>
                              <Text
                                component="a"
                                href={`${
                                  detail.latest.includes('https://')
                                    ? ''
                                    : location.origin
                                }${detail.latest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open Raw <ExternalLinkAltIcon size="sm" />
                              </Text>
                            </TextContent>
                          ) : (
                            <Skeleton size={SkeletonSize.mdmd} />
                          )}
                        </SplitItem>
                        <SplitItem className="ins-c-docs__api-detail-info">
                          {detail.loaded ? (
                            <Button
                              onClick={() => onModalToggle(true)}
                              variant={ButtonVariant.secondary}
                            >
                              Show JSON
                            </Button>
                          ) : (
                            <Skeleton size={SkeletonSize.md} />
                          )}
                        </SplitItem>
                      </Split>
                    </LevelItem>
                  </Level>
                )}
              </React.Fragment>
            </React.Fragment>
          }
        />
      </PageHeader>
      <Main>
        <React.Fragment>
          <Card>
            <CardBody>
              {detail.loaded && (
                <SwaggerUI
                  deepLinking
                  docExpansion="list"
                  spec={detail.spec}
                  requestInterceptor={requestInterceptor}
                  onComplete={(system) => {
                    const {
                      layoutActions: { show },
                    } = system;
                    system.layoutActions.show = (isShownKey, isShown) => {
                      history.replaceState(
                        {},
                        '',
                        `${location.pathname}#${CSS.escape(
                          isShownKey.join('-')
                        )}`
                      );
                      show(isShownKey, isShown);
                    };

                    if (location.hash && location.hash.length > 0) {
                      const found = document.querySelector(
                        `[id$='${location.hash
                          .replace('#', '')
                          .replace(/\\./g, '\\\\.')}']`
                      );
                      if (found) {
                        found.scrollIntoView();
                        show(
                          location.hash
                            .replace('#', '')
                            .replace(/\\/g, '')
                            .split('-'),
                          true
                        );
                      }
                    }
                  }}
                />
              )}
              {!detail.loaded && <Facebook />}
            </CardBody>
          </Card>
        </React.Fragment>
      </Main>
      <Modal
        width={'50%'}
        title="Spec JSON"
        isOpen={isOpen}
        onClose={() => onModalToggle(false)}
        actions={[
          <Button
            key="close"
            variant={ButtonVariant.secondary}
            onClick={() => onModalToggle(false)}
          >
            Close
          </Button>,
        ]}
      >
        <ReactJson
          displayDataTypes={false}
          shouldCollapse={({ name }) => name !== 'root' && name !== 'paths'}
          src={detail.spec}
        />
      </Modal>
    </React.Fragment>
  );
};

Detail.propTypes = {
  loadApi: PropTypes.func,
  detail: PropTypes.shape({
    loaded: PropTypes.bool,
    spec: PropTypes.string,
    error: PropTypes.bool,
    latest: PropTypes.string,
  }),
};
Detail.defaultProps = {
  loadApi: () => undefined,
  detail: {
    loaded: false,
  },
};

export default connect(
  ({ detail }) => ({
    detail,
  }),
  (dispatch) => ({
    loadApi: (api, version, url, github) =>
      dispatch(onLoadOneApi({ name: api, version, url, github })),
  })
)(Detail);
