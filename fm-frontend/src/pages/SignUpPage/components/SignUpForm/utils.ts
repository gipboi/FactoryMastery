import trim from "lodash/trim";
import { SetError } from "types/hookForm";
// import { countOrganizationsForSignUp } from "API/auth";
import { IOrganization } from "interfaces/organization";
import { SignUpFormValues } from "pages/SignUpPage/constants";
import UserStore from "stores/userStore";
import { Where } from "types/common";
import { IUser } from "interfaces/user";

export async function countSubdomain(
  subdomain: string,
  setError: SetError
): Promise<void> {
  if (!subdomain) return;
  const filter: Where<IOrganization> = {
    subdomain: {
      eq: trim(subdomain),
    },
  };
  // const numberOfOrganization: number = await countOrganizationsForSignUp(
  //   filter
  // );
  // if (numberOfOrganization > 0) {
  //   setError(SignUpFormValues.SUBDOMAIN, {
  //     message: "Subdomain exists!",
  //   });
  // }
}

export async function countUser(
  userStore: UserStore,
  email: string,
  setError: SetError
): Promise<void> {
  if (!email) return;
  const filter: Where<IUser> = {
    email: {
      eq: trim(email),
    },
  };
  const numberOfUser: number = await userStore.countUsers(filter);
  if (email && numberOfUser > 0) {
    setError(SignUpFormValues.EMAIL, {
      message: "Email exists!",
    });
  }
}
