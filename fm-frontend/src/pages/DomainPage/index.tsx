import { useState } from "react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import Logo from "assets/images/logo.png";
import {
  useFormContext,
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { CardText, CardTitle, Form } from "reactstrap";

import Button from "components/Button";
import Card from "components/Card";
import Icon from "components/Icon";
import Separator from "components/Separator";
import TextField from "components/TextField";
import routes from "routes";
import styles from "./styles.module.scss";
import ERRORS from "config/errors";
import { observer } from "mobx-react";

interface IDomainForm {
  subdomain: string;
}

type DomainFormProp = {
  onAccessOrganization?: SubmitHandler<IDomainForm>;
  submitting?: boolean;
};

const DomainForm = ({
  onAccessOrganization = () => {},
  submitting = false,
}: DomainFormProp) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useFormContext<IDomainForm>();
  return (
    <Form onSubmit={handleSubmit(onAccessOrganization)}>
      <Card className={styles.centerCard}>
        <img
          src={Logo}
          alt="logo"
          className={cx(styles.centerItem, styles.logoTop)}
        />
        <CardTitle tag="h3">Sign in to your organization</CardTitle>
        <CardText className={styles.bold}>
          Enter your organization's FactoryMastery URL.
        </CardText>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <TextField
            className={styles.inputOrg}
            autoComplete="off"
            {...register("subdomain", {
              required: {
                value: true,
                message: ERRORS.ORG_REQUIRED,
              },
            })}
            onChange={(event: { currentTarget: { value: string } }) =>
              setValue("subdomain", event.currentTarget.value)
            }
            placeholder="your-organization-url"
            error={!!errors.subdomain}
          />
          &nbsp;&nbsp;
          <CardText className={styles.bold}>.factorymastery.site</CardText>
        </div>
        <CardText
          style={{ visibility: errors.subdomain ? "visible" : "hidden" }}
          className={styles.errorText}
        >
          {errors.subdomain?.message}
        </CardText>
        <Button
          disabled={submitting}
          className={styles.submitBtn}
          color="secondary"
          onClick={handleSubmit(onAccessOrganization)}
        >
          Continue&nbsp;&nbsp;&nbsp;
          <Icon
            icon="arrow-thin-right"
            group="dripicon"
            style={{ fontSize: 18 }}
          />
        </Button>
        <CardText className={styles.bold} style={{ textAlign: "center" }}>
          Don't know your organization URL?{" "}
          <Link to="/">Find your organization</Link>
        </CardText>
        <Separator
          text="or"
          className={cx(styles.centerItem, styles.greySep)}
          style={{ width: "60%" }}
        />
        <Button
          outline
          className={styles.registerBtn}
          color="light"
          onClick={() => navigate(routes.signUp.value)}
        >
          Create a new organization
        </Button>
      </Card>
    </Form>
  );
};

const DomainPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const formMethods = useForm<IDomainForm>();
  const { organizationStore } = useStores();
  const mainHost = window.location.host
    .replace(/^(www\.)/, "")
    .replace(/^(app\.)/, "");

  const handleAccessOrganization = (data: IDomainForm) => {
    const { subdomain } = data;
    if (subdomain) {
      setSubmitting(true);
      formMethods.clearErrors();
      organizationStore
        .getOrganizationBySubdomain(subdomain)
        .then((org: any) => {
          if (org) {
            const subHost = `${window.location.protocol}//${subdomain}.${mainHost}/`;
            window.location.href = subHost;
          }
        })
        .catch((err: any) => {
          formMethods.setError("subdomain", { message: err.message });
          setSubmitting(false);
        });
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className={styles.container}>
        <DomainForm
          onAccessOrganization={handleAccessOrganization}
          submitting={submitting}
        />
      </div>
    </FormProvider>
  );
};

export default DomainPage;
