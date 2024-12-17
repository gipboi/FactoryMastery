import cx from "classnames";
import RAvatar from "react-avatar";
import styles from "./avatar.module.scss";

interface IAvatarProps {
  name: string;
  src?: string;
  className?: string;
  isLarge?: boolean;
  isMiddle?: boolean;
}

const Avatar = (props: IAvatarProps) => {
  const { src, name, className, isLarge, isMiddle } = props;

  return src ? (
    <img
      src={src}
      className={cx(
        styles.avatar,
        className,
        { [styles.large]: isLarge },
        { [styles.middle]: isMiddle }
      )}
      alt="avatar"
    />
  ) : (
    <RAvatar
      name={name}
      className={cx(
        styles.avatar,
        className,
        { [styles.large]: isLarge },
        { [styles.middle]: isMiddle }
      )}
      maxInitials={2}
    />
  );
};

export default Avatar;
