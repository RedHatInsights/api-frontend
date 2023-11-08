export type GitHubConfig = {
  owner: string;
  repo: string;
  path: string;
  content?: string;
};

export type APIItem = {
  title: string;
  versions: string[];
  url: string;
  github: GitHubConfig;
  readonly: boolean;
  apiName?: string;
};

export type Row = {
  name: string;
  isSelected?: boolean;
  selected?: boolean;
  cells: [{ value: string }, { value: string }, { value: string }];
  title: string;
  appName: string;
  version: string;
  apiName?: string;
  subItems: APIItem[];
  treeParent?: number;
  url?: string;
  posinset?: number;
  github?: GitHubConfig;
  frontend?: {
    title: string;
    paths: string[];
    sub_apps?: { title: string; id: string }[];
  };
  api: APIItem & {
    subItems?: {
      [key: string]: APIItem;
    };
  };
};

export type Service = {
  appName: string;
  apiName: string;
  api: {
    versions: string[];
    isBeta: boolean;
    alias: string[];
    apiName: string;
  };
  version: string;
};

export type ServicesState = {
  endpoints: Row[];
  loaded?: boolean;
  selectedRows: { [rowName: string]: Row };
};

export type DetailState = {
  loaded?: boolean;
  spec: any;
  error?: boolean;
  latest: string;
};

export type ReduxState = {
  services: ServicesState;
  detail: DetailState;
};
