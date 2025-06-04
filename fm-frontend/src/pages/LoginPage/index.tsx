import { useStores } from 'hooks/useStores';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form';
import styles from './styles.module.scss';
import { Card, CardText, CardTitle, Form } from 'reactstrap';
import Logo from 'assets/images/logo.png';
import cx from 'classnames';
import { Text } from '@chakra-ui/react';
import TextField from 'components/TextField';
import ERRORS from 'config/errors';
import Button from 'components/Button';
import { Link, useNavigate } from 'react-router-dom';
import routes from 'routes';
import Separator from 'components/Separator';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { observer } from 'mobx-react';

interface ILoginForm {
  username: string;
  password: string;
  organizationId: number;
}

type LoginFormProps = {
  onLogin?: SubmitHandler<ILoginForm>;
  subdomain: string;
  submitting?: boolean;
};

const LoginForm = ({
  onLogin = () => {},
  subdomain,
  submitting = false,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useFormContext<ILoginForm>();
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  return (
    <Form onSubmit={handleSubmit(onLogin)}>
      <Card className={styles.centerCard}>
        <img
          src={
            organization?.logo
              ? organization.logo
              : organization?.welcomeMessageImage
              ? organization.welcomeMessageImage
              : organization?.image || Logo
          }
          alt="logo"
          onError={(e) => {
            e.currentTarget.src = Logo;
          }}
          className={cx(styles.centerItem, styles.logoTop)}
        />
        <CardTitle
          tag="h3"
          className={styles.noMargin}
          style={{ textAlign: 'center' }}
        >
          Sign in to {subdomain}
        </CardTitle>
        <CardText style={{ textAlign: 'center' }}>
          {window.location.host.replace(/^(www\.)/, '')}
        </CardText>
        <Text
          fontSize="md"
          lineHeight={6}
          fontWeight={700}
          color="gray.700"
          textAlign="center"
        >
          {organization?.welcomeMessageText ?? ''}
        </Text>
        <CardText>
          Enter your <strong>email address</strong> and{' '}
          <strong>password</strong>.
        </CardText>
        <TextField
          className={styles.inputField}
          autoComplete=""
          placeholder="you@example.com"
          {...register('username', {
            required: {
              value: true,
              message: ERRORS.USERNAME_REQUIRED,
            },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: ERRORS.INVALID_EMAIL,
            },
          })}
          onChange={(e: { currentTarget: { value: string } }) =>
            setValue('username', e.currentTarget.value)
          }
          error={!!errors.username}
        />
        <CardText
          style={{ visibility: errors.username ? 'visible' : 'hidden' }}
          className={styles.errorText}
        >
          {errors.username?.message}
        </CardText>
        <TextField
          className={styles.inputField}
          placeholder="password"
          type="password"
          autoComplete=""
          {...register('password', {
            required: {
              value: true,
              message: ERRORS.PASSWORD_REQUIRED,
            },
          })}
          onChange={(e: { currentTarget: { value: string } }) =>
            setValue('password', e.currentTarget.value)
          }
          error={!!errors.password}
        />
        <CardText
          style={{ visibility: errors.password ? 'visible' : 'hidden' }}
          className={styles.errorText}
        >
          {errors.password?.message}
        </CardText>
        <Button
          disabled={submitting}
          className={styles.submitBtn}
          color="secondary"
          onClick={handleSubmit(onLogin)}
        >
          Sign in{submitting ? '...' : ''}
        </Button>
        <CardText style={{ textAlign: 'center' }} className={styles.bold}>
          <Link to={routes.forgotPassword.value}>Forgot password?</Link> -{' '}
          <Link to="/">Forgot which email you used?</Link>
        </CardText>
        <Separator
          text="or"
          className={cx(styles.centerItem, styles.greySep)}
          style={{ width: '60%' }}
        />
        <Button
          outline
          className={styles.registerBtn}
          onClick={() => {
            const signUpURL = `${
              window.location.protocol
            }//${window.location.host.replace(`${subdomain}.`, '')}/sign-up`;
            window.location.href = signUpURL;
          }}
        >
          Create a new organization
        </Button>
      </Card>
    </Form>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { authStore, organizationStore } = useStores();
  const formMethods = useForm<ILoginForm>();

  const [subdomain] = window.location.host.replace(/^(www\.)/, '').split('.');

  const handleLogin = (data: ILoginForm) => {
    const { username, password } = data;
    if (username && password) {
      setSubmitting(true);
      formMethods.clearErrors();
      authStore
        .login(username, password)
        .then((loggedin) => {
          if (authStore.resetPasswordToken && !loggedin) {
            toast.warning(
              'Your account has been reset password. Please enter new password'
            );
            navigate(
              `${routes.resetPassword.value}?token=${authStore.resetPasswordToken}`
            );
          }
          if (authStore.isDisabled && !loggedin) {
            toast.error(
              'Your account currently has been deactivated. Please contact the administrator.'
            );
            setSubmitting(false);
          }
          if (loggedin) {
            navigate(routes.dashboard.value);
          }
        })
        .catch((e) => {
          if (e?.status === 403) {
            toast.error('User not found or disabled');
          } else {
            formMethods.setError('username', {
              message: ERRORS.USERNAME_WRONG,
            });
            formMethods.setError('password', {
              message: ERRORS.PASSWORD_WRONG,
            });
          }
          setSubmitting(false);
        });
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className={styles.container}>
        <LoginForm
          subdomain={subdomain}
          onLogin={handleLogin}
          submitting={submitting}
        />
      </div>
    </FormProvider>
  );
};

export default observer(LoginPage);
