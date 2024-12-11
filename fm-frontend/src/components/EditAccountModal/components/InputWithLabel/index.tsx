import { forwardRef } from "react";
import cx from "classnames";
import get from "lodash/get";
import { useFormContext } from "react-hook-form";
import { InputProps } from "reactstrap";
import { Input as ReactstrapInput } from "reactstrap";
import ErrorMessage from "components/ErrorMessage";
import styles from "./inputWithLabel.module.scss";
import { HStack, Spinner } from "@chakra-ui/react";

interface IInputWithLabelProps extends InputProps {
  title: string;
  noPaddingTop?: boolean;
  loading?: boolean;
}

const InputWithLabel = forwardRef<any, IInputWithLabelProps>(
  (props: any, ref) => {
    const {
      formState: { errors },
    } = useFormContext();
    const { title, noPaddingTop, loading, ...inputProps } = props;
    const { name } = props;
    const errorMessage = get(errors, `${name}.message`, "") as string;

    return (
      <div
        className={cx(styles.wrapper, {
          [styles.noPaddingTop]: noPaddingTop,
        })}
      >
        <label className={styles.label}>{title}</label>
        <HStack position={"relative"}>
          <ReactstrapInput
            {...inputProps}
            className={cx(styles.input)}
            innerRef={ref}
          />
          {loading && (
            <Spinner
              size="sm"
              hidden={!loading}
              position={"absolute"}
              right={"10px"}
              transform={"translateY(-50%)"}
            />
          )}
        </HStack>
        {errorMessage && <ErrorMessage error={errorMessage} />}
      </div>
    );
  }
);

export default InputWithLabel;
