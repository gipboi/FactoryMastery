export const filterUserDetail = {
  include: [
    {
      relation: "groupMembers",
      scope: { include: [{ relation: "group" }] },
    },
    {
      relation: "userProcesses",
      scope: {
        include: [
          {
            relation: "process",
            scope: {
              include: [
                { relation: "creator" },
                {
                  relation: "groups",
                  scope: {
                    include: [
                      {
                        relation: "group",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};
