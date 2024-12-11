import { countUsers } from "API/user";
import { IUser } from "interfaces/user";
import { compact, trim } from "lodash";
import { Where } from "types/common";

export function getFirstAndLastName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName, ...lastNameArr] = fullName.split(" ");
  const lastName = lastNameArr.join(" ");
  return { firstName, lastName };
}

export async function checkDuplicateUserInOrganization(
  userNameOrEmail: string,
  organizationId: string,
  field: "username" | "email",
  isEdit: boolean = false
): Promise<boolean> {
  let identity = userNameOrEmail.trim();
  if (field === "email") {
    identity = identity.toLowerCase();
  }
  const numberOfUserWithSameUsername = await countUsers({
    [field]: { $eq: identity },
    organizationId,
  });
  return numberOfUserWithSameUsername > (isEdit ? 1 : 0);
}

export function getFullName(
  firstName: string | undefined,
  lastName: string | undefined
): string {
  const firstNameStr = firstName ?? "";
  const lastNameStr = lastName ?? "";
  return `${firstNameStr} ${lastNameStr}`;
}

export function getName(detail: any): string {
  if (detail?.firstName || detail?.lastName) {
    return getFullName(detail?.firstName, detail?.lastName);
  }

  if (detail?.username) {
    return detail?.username;
  }

  if (detail?.email) {
    return detail?.email;
  }

  return "";
}

function getFirstAndLastNameSearchKeyword(fullNameStr: string): {
  firstName: string;
  lastName: string;
  singleWord: boolean;
} {
  const fullName: string = trim(fullNameStr);
  if (!fullName) {
    return {
      firstName: "",
      lastName: "",
      singleWord: true,
    };
  }
  const splittedFullName: string[] = compact(fullName.split(" "));
  if (splittedFullName.length === 1) {
    return {
      firstName: splittedFullName[0],
      lastName: splittedFullName[0],
      singleWord: true,
    };
  }

  return {
    firstName: splittedFullName[0],
    lastName: splittedFullName.slice(1, splittedFullName.length).join(" "),
    singleWord: false,
  };
}

export function getSearchUserWhereQuery(searchText: string): Where<IUser> {
  const searchOptions = { $regex: `.*${trim(searchText)}.*`, $options: "i" };
  const { firstName, lastName, singleWord } =
    getFirstAndLastNameSearchKeyword(searchText);

  let whereQuery: Where<IUser> = {
    $or: [],
    $and: [],
  };

  if (singleWord) {
    whereQuery.$or?.push({ firstName: searchOptions });
    whereQuery.$or?.push({ lastName: searchOptions });
    whereQuery.$or?.push({ email: searchOptions });
    whereQuery.$or?.push({ username: searchOptions });
  } else {
    whereQuery.$and?.push({
      firstName: { $regex: `${firstName}`, $options: "i" },
    });
    whereQuery.$and?.push({
      lastName: { $regex: `${lastName}`, $options: "i" },
    });
  }

  return whereQuery;
}
