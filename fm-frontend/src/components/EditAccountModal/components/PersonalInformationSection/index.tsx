import { useStores } from "hooks/useStores";
import { IGroup } from "interfaces/groups";
import { observer } from "mobx-react";
import { useFormContext } from "react-hook-form";
import { Col, Row } from "reactstrap";
import Input from "../InputWithLabel";
import ProfilePictureSelector from "../ProfilePictureSelector";
import styles from "./personalInformationSection.module.scss";

interface IPersonalInformationSectionProps {
  userId: string;
}

const PersonalInformationSection = ({
  userId,
}: IPersonalInformationSectionProps) => {
  const { userStore, authStore, organizationStore } = useStores();
  const { selectedUserDetail } = userStore;
  const { organization } = organizationStore;
  const isMyAccount = userId === authStore?.userDetail?.id;
  const userDetail = isMyAccount ? userStore.userDetail : selectedUserDetail;
  const currentEmail = userDetail?.email;
  const currentUsername = userDetail?.username;
  const { register } = useFormContext();
  const requiredMessage = "This field is required";
  const members = userDetail?.groupMembers ?? [];
  const groups = members?.map(
    (member) => (member?.group as IGroup[])?.[0]?.name ?? ""
  );

  return (
    <div>
      <h2 className={styles.title}>Personal information</h2>
      <Row>
        <Col xs="6" sm="4">
          <ProfilePictureSelector userId={userId} />
        </Col>

        <Col className={styles.wrapper}>
          <Input
            {...register("role")}
            disabled
            title="Current role"
            noPaddingTop
          />
          <Input
            {...register("fullName")}
            disabled
            placeholder="Your full name"
            title="Full name"
          />
          <Input
            {...register("email", {})}
            disabled
            placeholder="Your email"
            title="Email"
          />
          <Input
            {...register("username", {})}
            disabled
            placeholder="Your username"
            title="Username"
          />
          {groups.length ? (
            <Col className={styles.groupWrapper}>
              <Row>
                <span className={styles.label}>Groups</span>
              </Row>
              <Row className={styles.colGroup}>
                {groups.map((group) => (
                  <span className={styles.groupTag}>{group}</span>
                ))}
              </Row>
            </Col>
          ) : null}
        </Col>
      </Row>
    </div>
  );
};

export default observer(PersonalInformationSection);
