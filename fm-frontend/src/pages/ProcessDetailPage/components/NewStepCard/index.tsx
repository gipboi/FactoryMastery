import { useStores } from "hooks/useStores";
import { useState } from "react";
import { Col, Row } from "reactstrap";
// import { createStep } from 'API/step'
import Button from "components/Button";
import Divider from "components/Divider";
import InlineTextField from "components/InlineTextField";
import SvgIcon from "components/SvgIcon";
import styles from "./styles.module.scss";
import { EIconDefaultId } from "interfaces/iconBuilder";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";
import { createStep } from "API/step";
import IconBuilder from "components/IconBuilder";
import { stepIcon } from "components/Icon";
// import { getRenderProcess } from "pages/ProcessDetailPage/utils/process";

interface NewStepCardProps {
  procedureId: string;
  newPosition: number;
  setIsStartEditing: () => void;
}

const NewStepCard = (props: NewStepCardProps) => {
  const { processStore } = useStores();
  const [creating, setCreating] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>("");

  async function handleCreateStep(newTitle: string) {
    if (newTitle) {
      setNewTitle(newTitle);
      setCreating(true);
      createStep({
        name: newTitle,
        processId: props.procedureId,
        position: props.newPosition,
        archived: false,
        //*TODO: Update when building the icon
        // iconId: EIconDefaultId.STEP,
        // layoutId: 1,
      })
        .then(() => getRenderProcess(props.procedureId, processStore))
        .finally(() => setCreating(false));
    }
  }

  return (
    <>
      <Row>
        <Col xl="12" lg="12" md="12" sm="12" xs="12" className={styles.newStep}>
          <div className={styles.layout}>
            <div className={styles.stepIcon}>
              <IconBuilder icon={stepIcon} size={40} isActive />
              {/* <SvgIcon iconName="steps" /> */}
            </div>
            <div className={styles.label}>
              <span>1.</span>
              <InlineTextField
                style={{ width: 500 }}
                value={newTitle}
                onApplyChange={handleCreateStep}
                editFirst
                onStartEdit={() => setCreating(true)}
                onStopEdit={() => setCreating(false)}
              />
            </div>
          </div>
          <div className={styles.editGroup}>
            <Button
              outline
              disabled
              color="white"
              colorScheme="red"
              background="red"
            >
              Delete Step
            </Button>
            <Button outline color="white" disabled colorScheme="info">
              Add step
            </Button>
            <Button
              outline
              color="white"
              disabled={creating}
              colorScheme="success"
            >
              Done Editing
            </Button>
          </div>
        </Col>
      </Row>
      <Divider />
      <Row>
        <div className={styles.newBtns}>
          <Button outline color="white" disabled colorScheme="info">
            Add new block
          </Button>
          <Button outline color="white" disabled colorScheme="info">
            Manage media
          </Button>
        </div>
      </Row>
    </>
  );
};

export default NewStepCard;
