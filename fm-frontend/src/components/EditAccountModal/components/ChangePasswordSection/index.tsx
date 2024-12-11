import { validatePassword } from "API/user";
import { observer } from "mobx-react";
import { useFormContext, useWatch } from "react-hook-form";
import Input from "../InputWithLabel";
import styles from "./changePasswordSection.module.scss";
import { useState } from "react";
import { Spinner } from "@chakra-ui/react";

interface IChangePasswordSectionProps {
  isProfile?: boolean;
  userId?: string;
}
const ChangePasswordSection = (props: IChangePasswordSectionProps) => {
  const { isProfile, userId } = props;
  const { register, control } = useFormContext();
  const newPassword = useWatch({ name: "newPassword", control });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Change password</h2>
      <div className={styles.newPasswordWrapper}>
        {isProfile && userId && (
          <Input
            {...register("oldPassword", {
              minLength: {
                value: 6,
                message: "Must be at least 6 characters",
              },
              validate: {
                isMatched: async (value) => {
                  if (value) {
                    setIsLoading(true);
                    const result = await validatePassword(userId, value)
                      .catch((e) => {
                        return "Wrong password";
                      })
                      .finally(() => {
                        setIsLoading(false);
                      });
                    return result || "Wrong password";
                  }
                  return true;
                },
              },
            })}
            type="password"
            title="Old password"
            placeholder="Your old password"
            noPaddingTop
            loading={isLoading} 
          />
        )}
        <Input
          {...register("newPassword", {
            minLength: {
              value: 6,
              message: "Must be at least 6 characters",
            },
          })}
          type="password"
          title="New password"
          placeholder="Your new password"
        />
        <Input
          {...register("confirmPassword", {
            validate: (value: string) =>
              !newPassword || 
              value === newPassword ||
              "Password does not matched",
          })}
          type="password"
          title="Confirm new password"
          placeholder="Your new password"
        />
      </div>
    </div>
  );
};

export default observer(ChangePasswordSection);
