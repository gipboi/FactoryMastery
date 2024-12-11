import { Fragment } from "react";
import get from "lodash/get";
import { useFormContext, Controller } from "react-hook-form";
import { Col, Row } from "reactstrap";
import InputGroup from "components/InputGroup";
import { PASSWORD_PATTERN } from "constants/formValidations";
import { SignUpFormValues } from "pages/SignUpPage/constants";
import styles from "../../styles.module.scss";
import { isEmail } from "utils/common";
import { Grid, GridItem } from "@chakra-ui/react";

const AuthenticateForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Fragment>
      <Grid
        className={styles.smallPaddingTop}
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem>
          <Controller
            name={SignUpFormValues.EMAIL}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Email is required",
              },
              validate: (value) => isEmail(value) || "Invalid email format",
            }}
            render={({ field }) => (
              <InputGroup
                label="Email"
                labelClassName={styles.defaultLabel}
                placeholder="Your email"
                type="text"
                smallSpacing
                {...field}
                error={String(
                  get(errors, `${SignUpFormValues.EMAIL}.message`, "")
                )}
              />
            )}
          />
        </GridItem>
        <GridItem>
          <Controller
            name={SignUpFormValues.USER_NAME}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Username is required",
              },
              pattern: {
                value: /^[a-z0-9]+$/,
                message: "Only accept lowercase alphabets, number",
              },
            }}
            render={({ field }) => (
              <InputGroup
                label="Username"
                labelClassName={styles.defaultLabel}
                placeholder="Username"
                type="text"
                smallSpacing
                {...field}
                error={String(
                  get(errors, `${SignUpFormValues.USER_NAME}.message`, "")
                )}
              />
            )}
          />
        </GridItem>
      </Grid>
      <Row className={styles.smallPaddingTop}>
        <Col md="12">
          <Controller
            name={SignUpFormValues.PASSWORD}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Password is required",
              },
              minLength: {
                value: 8,
                message: "Password must at least 8 characters",
              },
              pattern: {
                value: PASSWORD_PATTERN,
                message:
                  "Password must have at least one uppercase, one lowercase, one digit",
              },
            }}
            render={({ field }) => (
              <InputGroup
                label="Password"
                labelClassName={styles.defaultLabel}
                placeholder="Your password"
                type="password"
                smallSpacing
                {...field}
                error={String(
                  get(errors, `${SignUpFormValues.PASSWORD}.message`, "")
                )}
              />
            )}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default AuthenticateForm;
