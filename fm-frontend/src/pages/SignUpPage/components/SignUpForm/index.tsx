import { useEffect, useState } from "react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import trim from "lodash/trim";
import { observer } from "mobx-react";
import { useFormContext, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { CardText, CardTitle, Form } from "reactstrap";
import { Where } from "types/common";
// import { countOrganizationsForSignUp } from "API/auth";
import Button from "components/Button";
// import FormDropdownInput from "components/FormInputs/DropdownInput";
import Separator from "components/Separator";
import { IOrganization } from "interfaces/organization";
import { roleOptions, SignUpFormValues } from "pages/SignUpPage/constants";
import { ISignUpForm } from "pages/SignUpPage/types";
import routes from "routes";
// import { handleCreateOrganization } from "../utils";
import AuthenticateForm from "./components/AuthenticateForm";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { handleCreateOrganization } from "pages/SignUpPage/utils";
import { SUBDOMAIN_PATTERN } from "constants/formValidations";
import ErrorMessage from "components/ErrorMessage";
import InputGroup from "components/InputGroup";
import { Grid, GridItem } from "@chakra-ui/react";
import DropdownForm from "components/DropdownForm";

const SignUpForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { authStore } = useStores();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useFormContext<ISignUpForm>();
  const navigate = useNavigate();

  useEffect(() => {
    register(SignUpFormValues.SUBMIT);
  }, [register]);

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <CardTitle tag="h3" className={styles.noMargin}>
        Sign-up for free
      </CardTitle>
      <Grid
        className={styles.smallPaddingTop}
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem>
          <Controller
            name={SignUpFormValues.ORGANIZATION_NAME}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Organization name is required",
              },
            }}
            render={({ field }) => (
              <InputGroup
                label="Organization name"
                labelClassName={styles.defaultLabel}
                placeholder="Your organization name"
                type="text"
                smallSpacing
                {...field}
                error={get(
                  errors,
                  `${SignUpFormValues.ORGANIZATION_NAME}.message`,
                  ""
                )}
              />
            )}
          />
        </GridItem>
        <GridItem>
          <div className={styles.dropdownWrapper}>
            <CardTitle className={cx(styles.defaultLabel, styles.marginBottom)}>
              Role in organization
            </CardTitle>{" "}
            <DropdownForm
              name="authRole"
              control={control}
              options={roleOptions}
              rules={{ required: "Role is required" }}
              className={styles.dropdown}
            />
            {/* <FormDropdownInput
              controllerProps={{ name: SignUpFormValues.USER_ROLE, control }}
              inputProps={{
                name: "authRoleId",
                options: roleOptions,
                hasNoSeparator: true,
                className: styles.dropdown,
                placeholder: "Your role",
              }}
            /> */}
          </div>
        </GridItem>
      </Grid>
      <Grid className={styles.smallPaddingTop}>
        <GridItem>
          <CardText className={styles.defaultLabel}>
            Create an organization, no credit card commitment
          </CardText>
        </GridItem>
      </Grid>
      <Grid
        className={styles.smallPaddingTop}
        templateColumns="repeat(4, 1fr)"
        gap={4}
      >
        <GridItem colSpan={3}>
          <Controller
            name={SignUpFormValues.SUBDOMAIN}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Subdomain is required",
              },
              pattern: {
                value: SUBDOMAIN_PATTERN,
                message:
                  "Only accept lowercase alphabets, number and dashes in between",
              },
              validate: {
                checkExists: async (value) => {
                  setLoading(true);
                  if (value) {
                    const filter: Where<IOrganization> = {
                      subdomain: {
                        eq: trim(value),
                      },
                    };
                    // const numberOfOrganization: number =
                    //   await countOrganizationsForSignUp(filter);
                    const numberOfOrganization: number = 1;
                    setLoading(false);
                    // return numberOfOrganization > 0 ? "Subdomain exists" : true;
                    return true;
                  }
                  setLoading(false);
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <InputGroup
                labelClassName={styles.defaultLabel}
                placeholder="Your organization url"
                type="text"
                smallSpacing
                {...field}
                error={get(errors, `${SignUpFormValues.SUBDOMAIN}.message`, "")}
              />
            )}
          />
        </GridItem>
        <GridItem className={styles.domainStyle}>
          <CardText className={styles.defaultLabel}>
            .factorymastery.com
          </CardText>
        </GridItem>
      </Grid>
      <Grid
        className={styles.smallPaddingTop}
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem>
          <Controller
            name={SignUpFormValues.FIRST_NAME}
            control={control}
            rules={{
              required: {
                value: true,
                message: "First name is required",
              },
            }}
            render={({ field }) => (
              <InputGroup
                label="First name"
                labelClassName={styles.defaultLabel}
                placeholder="Your first name"
                type="text"
                smallSpacing
                {...field}
                error={get(
                  errors,
                  `${SignUpFormValues.FIRST_NAME}.message`,
                  ""
                )}
              />
            )}
          />
        </GridItem>
        <GridItem>
          <Controller
            name={SignUpFormValues.LAST_NAME}
            control={control}
            rules={{
              required: {
                value: true,
                message: "Last name is required",
              },
            }}
            render={({ field }) => (
              <InputGroup
                label="Last name"
                labelClassName={styles.defaultLabel}
                placeholder="Your last name"
                type="text"
                smallSpacing
                {...field}
                error={get(errors, `${SignUpFormValues.LAST_NAME}.message`, "")}
              />
            )}
          />
        </GridItem>
      </Grid>
      <AuthenticateForm />
      <div className={styles.buttonWrapper}>
        <Button
          className={cx(styles.submitBtn, styles.smallPaddingTop)}
          color="secondary"
          width="full"
          isLoading={loading}
          onClick={handleSubmit(async (formValues: ISignUpForm) => {
            if (loading) return;
            setLoading(true);
            await handleCreateOrganization(setError, authStore, formValues);
            setLoading(false);
          })}
        >
          {loading ? "Creating..." : "Create organization"}
        </Button>
        <ErrorMessage
          error={get(errors, `${SignUpFormValues.SUBMIT}.message`, "")}
        />
        <Separator
          text="or"
          className={cx(styles.centerItem, styles.greySep)}
          style={{ width: "60%" }}
        />
        <Button
          outline
          className={styles.registerBtn}
          color="light"
          width="full"
          backgroundColor="white"
          onClick={() => navigate(routes.home.value)}
        >
          Login
        </Button>
      </div>
    </Form>
  );
};

export default observer(SignUpForm);
