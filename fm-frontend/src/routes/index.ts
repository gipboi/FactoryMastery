const { REACT_APP_BASE_PATH } = process.env;

const routes = {
  home: {
    value: "/",
  },
  signUp: {
    value: "/sign-up",
  },
  login: {
    value: "/login",
  },
  logout: {
    value: "/logout",
  },
  forgotPassword: {
    value: "/forgot-password",
  },
  resetPassword: {
    value: "/reset-password",
  },
  dashboard: {
    value: "/dashboard",
  },
  subdomain: {
    dashboard: {
      value: (subdomain: string) =>
        `${subdomain}.${REACT_APP_BASE_PATH}/dashboard`,
    },
    processes: {
      value: (subdomain: string) =>
        `${subdomain}.${REACT_APP_BASE_PATH}/processes`,
    },
    search: {
      value: (subdomain: string) =>
        `${subdomain}.${REACT_APP_BASE_PATH}/search`,
    },
  },
  processes: {
    value: "/processes",
    processId: {
      value: (processId: string) => `/processes/${processId}`,
    },
  },
  search: {
    value: "/search",
  },
  collections: {
    value: "/collections",
    collectionId: {
      value: (collectionId: string) => `/collections/${collectionId}`,
    },
    collectionOfGroup: {
      value: (groupId: string) => `/collections?groupId=${groupId}`,
    },
  },
  users: {
    value: "/users",
    userId: {
      value: (userId: string) => `/users/${userId}`,
    },
  },
  groups: {
    value: "/groups",
    groupId: {
      value: (groupId: string) => `/groups/${groupId}`,
    },
  },
  commonLibrary: {
    value: "/common-library",
  },
  setting: {
    value: "/setting",
    documentType: {
      value: "/setting/document-type",
    },
    iconBuilder: {
      value: "/setting/icon-builder",
    },
    tag: {
      value: "/setting/tag",
    },
    appearance: {
      value: "/setting/appearance",
    },
  },
  notifications: {
    value: "/notifications",
  },
  archive: {
    value: "/archive",
  },
  messages: {
    value: "/messages",
  },
  report: {
    organization: {
      value: "/organization/report",
    },
  },
  admin: {
    value: "/",
    report: {
      value: "/report",
    },
  },
  step: {
    value: "/step",
  },
  message: {
    value: "/message",
  },
};

export default routes;
