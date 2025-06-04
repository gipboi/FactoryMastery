import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import cx from "classnames";
import styles from "./styles.module.scss";

interface IButtonProps extends Omit<ButtonProps, "outline"> {
  targetHover?: boolean;

  color?: string;
  textColor?: string;
  outline?: boolean;
  className?: string;
}

const Button = ({
  textColor,
  color = "secondary",
  outline = false,
  className,
  ...props
}: IButtonProps) => {
  let constructClasses = cx(styles.hfButton, "btn");
  if (color) {
    if (outline)
      constructClasses = cx(constructClasses, `btn-outline-${color}`);
    else constructClasses = cx(constructClasses, `btn-${color}`);
  }

  return (
    <ChakraButton
      className={cx(constructClasses, className)}
      // *INFO: For not replace old style
      color={color || "undefined"}
      fontSize="undefined"
      fontWeight="undefined"
      background="undefined"
      {...props}
    />
  );
};

export default Button;
