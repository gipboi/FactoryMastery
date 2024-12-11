export const filter = {
  include: [
    // {
    //   relation: "groupMembers",
    //   scope: {
    //     include: [{ relation: "group" }, { relation: "groupMemberPermission" }],
    //   },
    // },
    // {
    //   relation: 'userCollections',
    //   scope: { include: [{ relation: 'collection' }] }
    // },
    // {
    //   relation: 'userProcesses',
    //   scope: { include: [{ relation: 'process' }] }
    // },
    {
      relation: "authRole",
    },
  ],
};
