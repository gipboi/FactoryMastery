export const getUserDetailProjectPipeline = {
  $project: {
    _id: false,
    id: '$_id',
    createdAt: true,
    updatedAt: true,
    encryptedPassword: true,
    lastSignInAt: true,
    firstName: true,
    lastName: true,
    username: true,
    image: true,
    email: true,
    isInactive: true,
    disabled: true,
    organizationId: true,
    groupMembers: true,
    groups: true,
    authRole: true,
  },
};

export function getFullName(firstName, lastName) {
  const firstNameStr = firstName ?? '';
  const lastNameStr = lastName ?? '';
  return `${firstNameStr} ${lastNameStr}`;
}

export function getName(detail) {
  if (detail?.firstName || detail?.lastName) {
    return getFullName(detail?.firstName, detail?.lastName);
  }

  if (detail?.username) {
    return detail?.username;
  }

  if (detail?.email) {
    return detail?.email;
  }

  return '';
}
