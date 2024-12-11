import cx from "classnames";
import { Card as RSCard, CardProps as RSCardProps } from "reactstrap";
import styles from "./styles.module.scss";

const Card = (props: RSCardProps) => {
  const { className, ...otherProps } = props;
  return <RSCard {...otherProps} className={cx(styles.hfCard, className)} />;
};

export default Card;
