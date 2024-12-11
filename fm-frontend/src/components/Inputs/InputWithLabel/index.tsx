import cx from "classnames";
import ErrorMessage from "components/ErrorMessage";
import get from "lodash/get";
import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { InputProps, Input as ReactstrapInput } from "reactstrap";
import styles from "./inputWithLabel.module.scss";

interface IInputWithLabelProps extends InputProps {
  title: string;
  noPaddingTop?: boolean;
}

const InputWithLabel = forwardRef<any, IInputWithLabelProps>(
  (props: any, ref) => {
    const methods = useFormContext();
    const {
      formState: { errors },
      control,
    } = methods;
    const { title, noPaddingTop, ...inputProps } = props;
    const { name } = props;
    const errorMessage: string = get(errors, `${name}.message`, "") as string;

    return (
      <div
        className={cx(styles.wrapper, {
          [styles.noPaddingTop]: noPaddingTop,
        })}
      >
        <label className={styles.label}>{title}</label>
        <ReactstrapInput
          {...inputProps}
          className={cx(styles.input)}
          control={control}
          innerRef={ref}
        />
        {errorMessage && <ErrorMessage error={errorMessage} />}
      </div>
    );
  }
);

export default InputWithLabel;
