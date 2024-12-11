import Image from "components/Image";
import { useStores } from "hooks/useStores";
import { Col, Row } from "reactstrap";

import styles from "./header.module.scss";

const Header = () => {
  const { processStore, organizationStore } = useStores();
  const { process } = processStore;

  return (
    <Row className={styles.container}>
      <Col className={styles.layout} md="12">
        <div className={styles.title}>
          <Image
            width={32}
            height={32}
            src={organizationStore.organization?.id ?? ""}
            alt={process.name}
          />
          <span className={styles.text}>{process.name}</span>
        </div>
      </Col>
    </Row>
  );
};

export default Header;
