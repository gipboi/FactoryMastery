import cx from "classnames";
import Avatar from "components/Avatar";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getName } from "utils/user";
import { ReactComponent as CancelIcon } from "../../../../assets/icons/cancel-icon.svg";
import { ReactComponent as CheckIcon } from "../../../../assets/icons/check-icon.svg";
import { ReactComponent as EditIcon } from "../../../../assets/icons/edit-icon.svg";
import styles from "./profilePictureSelector.module.scss";

interface IProfilePictureSelectorProps {
  userId: string;
}

const ProfilePictureSelector = ({ userId }: IProfilePictureSelectorProps) => {
  const { setValue, register, getValues } = useFormContext();
  const { userStore, authStore } = useStores();
  const fileInputRef = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [isEdit, setIsEdit] = useState(false);
  const [preview, setPreview] = useState("");
  const [selectedPicture, setSelectedPicture] = useState("");
  const { selectedUserDetail } = userStore;
  const isMyAccount = userId === authStore?.userDetail?.id;
  const userDetail = isMyAccount ? userStore.userDetail : selectedUserDetail;
  const imageUrl = userDetail?.image
    ? (userDetail?.organizationId ?? "", userDetail.image)
    : "";
  const name = getName(userDetail);

  useEffect(() => {
    register("imageFile");
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // eslint-disable-next-line consistent-return
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function onSelectFile(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile(event.target.files[0]);
    setIsEdit(true);
  }

  function handleOpenPreview(): void {
    fileInputRef?.current?.click();
  }

  function handleCancel(): void {
    setIsEdit(false);
    setSelectedFile(undefined);
    setPreview("");
    setSelectedPicture("");
  }

  async function handleAccept(): Promise<void> {
    if (selectedFile) {
      setValue("imageFile", selectedFile);
      setSelectedPicture(preview);
      setIsEdit(false);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }

  return (
    <div className={styles.profileWrapper}>
      <Avatar
        src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl ?? ""}
        name={name}
        className={styles.avatar}
      />
      {isEdit ? (
        <div
          className={cx(styles.iconEdit, styles.pointer, styles.submit)}
          onClick={handleAccept}
        >
          {<CheckIcon width={30} height={30} />}
        </div>
      ) : (
        <div
          className={cx(styles.iconEdit, styles.pointer)}
          onClick={handleOpenPreview}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onSelectFile}
            style={{ display: "none" }}
          />
          {<EditIcon width={24} height={24} />}
        </div>
      )}

      {isEdit && (
        <div
          className={cx(styles.iconEdit, styles.pointer, styles.iconCancel)}
          onClick={handleCancel}
        >
          <CancelIcon width={30} height={30} />
        </div>
      )}
    </div>
  );
};

export default observer(ProfilePictureSelector);
