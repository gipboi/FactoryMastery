import cx from "classnames";
import Logo from "assets/images/logo.png";
import { FormProvider, useForm } from "react-hook-form";
import Card from "components/Card";
import { ISignUpForm } from "./types";
import styles from "./styles.module.scss";
import SignUpForm from "./components/SignUpForm";
import { AuthRoleNameEnum } from "constants/user";

const SignUpPage = () => {
  const methods = useForm<ISignUpForm>({
    reValidateMode: "onChange",
    mode: "onBlur",
    defaultValues: {
      authRole: AuthRoleNameEnum.ORG_ADMIN,
    },
  });

  return (
    <FormProvider {...methods}>
      <div className={styles.container}>
        <Card className={styles.centerCard}>
          <img
            src={Logo}
            alt="logo"
            className={cx(styles.centerItem, styles.logoTop)}
          />
          <div className={styles.formLayout}>
            <SignUpForm />
          </div>
        </Card>
      </div>
    </FormProvider>
  );
};

export default SignUpPage;
