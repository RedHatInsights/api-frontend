import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { useDispatch, useSelector } from 'react-redux';
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
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import ReactJson from 'react-json-view';
import { useQuery } from '../Utilities/hooks';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const Detail = () => {
  const dispatch = useDispatch();
  const loaded = useSelector(({ detail: { loaded } }) => loaded);
  const spec = useSelector(({ detail: { spec } }) => spec);
  const error = useSelector(({ detail: { error } }) => error);
  const latest = useSelector(({ detail: { latest } }) => latest);
  const { apiName, version = 'v1' } = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const { auth } = useChrome();
  useEffect(() => {
    dispatch(
      onLoadOneApi({
        name: apiName,
        version,
        url: query.get('url'),
        github: {
          owner: query.get('github-owner'),
          repo: query.get('github-repo'),
          content: query.get('github-content'),
        },
      })
    );
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
                {loaded && !error && (
                  <Level className="ins-c-docs__api-detail">
                    <LevelItem className="ins-c-docs__api-detail-info">
                      {loaded ? (
                        `Detail of ${spec?.info?.title}`
                      ) : (
                        <Skeleton size={SkeletonSize.md} />
                      )}
                    </LevelItem>
                    <LevelItem>
                      <Split hasGutter>
                        <SplitItem className="ins-c-docs__api-detail-info">
                          {loaded && !error ? (
                            <TextContent>
                              <Text
                                component="a"
                                href={`${
                                  latest.includes('https://')
                                    ? ''
                                    : location.origin
                                }${latest}`}
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
                          {loaded ? (
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
              {loaded && (
                <SwaggerUI
                  docExpansion="list"
                  {...(query.get('readonly') && {
                    supportedSubmitMethods: [''],
                  })}
                  spec={spec}
                  requestInterceptor={requestInterceptor}
                  onComplete={(system) => {
                    const {
                      layoutActions: { show },
                    } = system;
                    system.layoutActions.show = (isShownKey, isShown) => {
                      const newHash = CSS.escape(isShownKey.join('-'));
                      const oldHash = location.hash
                        ?.replace('#', '')
                        ?.replace(/\\./g, '\\\\.');
                      show(isShownKey, isShown);
                      if (isShown && newHash !== oldHash) {
                        navigate(
                          `/${apiName}/${version}?${query.toString()}#${newHash}`,
                          { replace: true }
                        );
                      }
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
              {!loaded && <Facebook />}
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
          src={spec}
        />
      </Modal>
    </React.Fragment>
  );
};

export default Detail;
