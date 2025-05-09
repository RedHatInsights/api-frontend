import ReactJson from '@microlink/react-json-view';
import {
  Breadcrumb,
  BreadcrumbItem,
} from '@patternfly/react-core/dist/dynamic/components/Breadcrumb';
import {
  Button,
  ButtonVariant,
} from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Card,
  CardBody,
} from '@patternfly/react-core/dist/dynamic/components/Card';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core/dist/dynamic/components/Modal';
import {
  Level,
  LevelItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Level';
import {
  Split,
  SplitItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Split';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { AxiosRequestConfig } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Facebook } from 'react-content-loader';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { onLoadOneApi } from '../store/actions';
import { ReduxState } from '../store/store';
import { BASENAME } from '../Utilities/const';
import { useQuery } from '../Utilities/hooks';

const Detail = () => {
  const dispatch = useDispatch();
  const loaded = useSelector(({ detail: { loaded } }: ReduxState) => loaded);
  const spec = useSelector(({ detail: { spec } }: ReduxState) => spec);
  const error = useSelector(({ detail: { error } }: ReduxState) => error);
  const latest = useSelector(({ detail: { latest } }: ReduxState) => latest);
  const { apiName, version = 'v1' } = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const { auth } = useChrome();
  useEffect(() => {
    dispatch(
      onLoadOneApi({
        name: apiName!,
        version,
        url: query.get('url')!,
        github: {
          owner: query.get('github-owner')!,
          repo: query.get('github-repo')!,
          content: query.get('github-content')!,
        },
      })
    );
  }, []);

  const requestInterceptor = useCallback(
    async (req: AxiosRequestConfig) => {
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
                  <Link to={BASENAME}>Overview</Link>
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
                            <Button
                              variant={'link'}
                              component={'a'}
                              href={`${
                                latest.includes('https://')
                                  ? ''
                                  : location.origin
                              }${latest}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<ExternalLinkAltIcon />}
                              iconPosition="end"
                            >
                              Open Raw
                            </Button>
                          ) : (
                            <Skeleton size={SkeletonSize.md} />
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
                    system.layoutActions.show = (
                      isShownKey: string[],
                      isShown: boolean
                    ) => {
                      const newHash = CSS.escape(isShownKey.join('-'));
                      const oldHash = location.hash?.replace('#', '');
                      show(isShownKey, isShown);
                      if (isShown && newHash !== oldHash) {
                        navigate(
                          `${BASENAME}/${apiName}/${version}?${query.toString()}#${newHash}`,
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
      <Modal width={'50%'} isOpen={isOpen} onClose={() => onModalToggle(false)}>
        <ModalHeader title={'Spec JSON'} />
        <ModalBody>
          <ReactJson
            displayDataTypes={false}
            shouldCollapse={({ name }) => name !== 'root' && name !== 'paths'}
            src={spec}
            enableClipboard={({ src }) =>
              navigator.clipboard.writeText(JSON.stringify(src, null, 2))
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button
            key="close"
            variant={ButtonVariant.secondary}
            onClick={() => onModalToggle(false)}
          >
            Close
          </Button>
          ,
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Detail;
