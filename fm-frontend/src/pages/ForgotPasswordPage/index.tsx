import { useState } from "react";
import cx from "classnames";
import Logo from "assets/images/logo.png";
import { isValidEmail } from "utils/common";
import {
  useFormContext,
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CardText, CardTitle, Form } from "reactstrap";
import { requestForgotPassword } from "API/auth";
import Button from "components/Button";
import Card from "components/Card";
import Icon from "components/Icon";
import Input from "components/Inputs/InputWithLabel";
import Separator from "components/Separator";
import routes from "routes";
import styles from "./styles.module.scss";
import FormInput from "components/FormInput";
import { Box } from "@chakra-ui/react";

interface IForgotPasswordForm {
  email: string;
}

interface IForgotPasswordFormProps {
  onRequestPwdChange?: SubmitHandler<IForgotPasswordForm>;
  submitting?: boolean;
}

const ForgotPasswordForm = (props: IForgotPasswordFormProps) => {
  const { onRequestPwdChange = () => {}, submitting = false } = props;
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<IForgotPasswordForm>();
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
        <Box marginBottom={5}>
          <FormInput
            name="email"
            rules={{
              required: requiredMessage,
              validate: isValidEmail,
            }}
            placeholder="Your email"
            label="Enter your email"
          />
        </Box>
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

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const subdomain = window?.location?.host?.split(".")[0];
  const [submitting, setSubmitting] = useState(false);
  const formMethods = useForm<IForgotPasswordForm>();

  async function handleRequestChangePassword(data: IForgotPasswordForm) {
    const { email } = data;
    if (email) {
      formMethods.clearErrors();
      try {
        setSubmitting(true);
        await requestForgotPassword(email, subdomain);
        toast.success(
          "Instruction to reset password has been sent to your email.",
           {
            autoClose: 7000,
           }
        );
        navigate(routes.login.value);
      } catch (error: any) {
        toast.error("Something wrong happened");
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <FormProvider {...formMethods}>
      <div className={styles.container}>
        <ForgotPasswordForm
          onRequestPwdChange={handleRequestChangePassword}
          submitting={submitting}
        />
      </div>
    </FormProvider>
  );
};

export default ForgotPasswordPage;
