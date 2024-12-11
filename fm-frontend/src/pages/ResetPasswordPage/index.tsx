import { resetPassword } from "API/auth";
import cx from "classnames";
import Button from "components/Button";
import Card from "components/Card";
import Icon from "components/Icon";
import Input from "components/Inputs/InputWithLabel";
import Separator from "components/Separator";
import { PASSWORD_PATTERN } from "constants/formValidations";
import Logo from "assets/images/logo.png";
import qs from "qs";
import { useState } from "react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CardText, CardTitle, Form } from "reactstrap";
import routes from "routes";
import styles from "./styles.module.scss";

interface IForgotPasswordForm {
  newPassword: string;
  confirmNewPassword: string;
}

interface IResetPasswordFormProps {
  onRequestPwdChange?: SubmitHandler<IForgotPasswordForm>;
  submitting?: boolean;
}

const ResetPasswordForm = (props: IResetPasswordFormProps) => {
  const { onRequestPwdChange = () => {}, submitting = false } = props;
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useFormContext<IForgotPasswordForm>();
  const newPasswordValue = useWatch({ name: "newPassword", control });
  const requiredMessage = "This field is required";

  return (
    <Form onSubmit={handleSubmit(onRequestPwdChange)}>
      <Card className={styles.centerCard}>
        <img
          src={Logo}
          alt="logo"
          className={cx(styles.centerItem, styles.logoTop)}
        />
        <CardTitle className={styles.centerText} tag="h3">
          Reset your password
        </CardTitle>
        <div>
          <Input
            type="password"
            {...register("newPassword", {
              required: requiredMessage,
              minLength: {
                value: 8,
                message: "Password must at least 8 characters",
              },
              pattern: {
                value: PASSWORD_PATTERN,
                message:
                  "Password must have at least one uppercase, one lowercase, one digit",
              },
            })}
            placeholder="Your new password"
            title="New password"
          />
          <Input
            type="password"
            {...register("confirmNewPassword", {
              required: requiredMessage,
              validate: (value: string) =>
                value === newPasswordValue || "Password does not matched",
            })}
            placeholder="Confirm your new password"
            title="Confirm new password"
          />
        </div>
        <CardText
          style={{ visibility: errors.newPassword ? "visible" : "hidden" }}
          className={styles.errorText}
        >
          {errors.newPassword?.message}
        </CardText>
        <Button
          disabled={submitting}
          className={styles.submitBtn}
          color="secondary"
          onClick={handleSubmit(onRequestPwdChange)}
        >
          Submit
        </Button>
        <Separator
          text="or"
          className={cx(styles.centerItem, styles.greySep)}
          style={{ width: "60%" }}
        />
        <Button
          outline
          className={styles.registerBtn}
          color="light"
          onClick={() => navigate(routes.login.value)}
        >
          <Icon
            icon="arrow-thin-left"
            group="dripicon"
            style={{ fontSize: 18 }}
          />{" "}
          Back to login
        </Button>
      </Card>
    </Form>
  );
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = qs.parse(location.search);
  let resetToken = query["?resetPasswordToken"] as string;
  const [submitting, setSubmitting] = useState(false);
  const formMethods = useForm();

  async function handleRequestChangePwd({ newPassword }: IForgotPasswordForm) {
    try {
      setSubmitting(true);
      await resetPassword({ resetToken, newPassword });
      toast.success("Reset password successfully");
      navigate(routes.home.value);
    } catch (error: any) {
      toast.error("Reset password failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...formMethods}>
      <div className={styles.container}>
        <ResetPasswordForm
          onRequestPwdChange={handleRequestChangePwd}
          submitting={submitting}
        />
      </div>
    </FormProvider>
  );
};

export default ResetPasswordPage;
