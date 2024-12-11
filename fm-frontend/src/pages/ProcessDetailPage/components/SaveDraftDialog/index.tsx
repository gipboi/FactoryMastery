import cx from "classnames";
import Button from "components/Button";
import Input from "components/Inputs/InputWithLabel";
import ModalDialog from "components/ModalDialog";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import omit from "lodash/omit";
import { observer } from "mobx-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { createDraft } from '../../../../../API/draft'
import SaveDraftSuccess from "./components/SaveDraftSuccess";
import styles from "./saveDraft.module.scss";
import { validatePatternVersion, validateVersion } from "./utils";

interface ISaveDraftDialogProps {
  toggle: () => void;
  isOpen: boolean;
}

const SaveDraftDialog = ({ toggle, isOpen }: ISaveDraftDialogProps) => {
  const methods = useForm({ mode: "onBlur", reValidateMode: "onBlur" });
  const params = useParams();
  const navigate = useNavigate();
  const processId = Number(get(params, "processId", ""));
  const { register, control } = methods;
  const { processStore } = useStores();
  const { process } = processStore;
  const currentVersion = process?.version ?? "1.0.0";
  const [showModalSuccess, setShowModalSuccess] = useState<boolean>(false);
  const formId = "version-control-form";
  const version: string = useWatch({ name: "version", control }) || "";

  async function onSubmit(data: any) {
    const newDraft = {
      ...omit(process, [
        "createdAt",
        "updatedAt",
        "id",
        "documentType",
        "collaborators",
      ]),
      version: data?.version ?? "",
      releaseNote: data?.releaseNote ?? "",
    };
    try {
      // const newProcess = await createDraft(newDraft, processId);
      // navigate(
      //   `${routes.processes.processId.value(newProcess?.id.toString())}`,
      //   { replace: true }
      // );
      toast.success("Create draft successfully");
      toggle();
    } catch (error: any) {
      toast.error("Create draft failed");
    }
  }

  return (
    <>
      <ModalDialog
        headless
        className={cx(styles.saveDraft)}
        isOpen={isOpen}
        onClose={toggle}
      >
        <FormProvider {...methods}>
          <form id={formId} onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="d-flex justify-content-between">
              <h4>Save draft</h4>
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                onKeyDown={(event: any) =>
                  validatePatternVersion(event, version)
                }
                {...register("version", {
                  required: "This field is required",
                  validate: {
                    isLarger: (value) =>
                      validateVersion(currentVersion, value) ||
                      "New version must not be smaller than current version",
                  },
                })}
                className={styles.inputField}
                placeholder={process?.version ?? ""}
                title="Please assign a version to the draft you are saving"
              />
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                placeholder={process?.releaseNote ?? ""}
                className={styles.inputField}
                title="Release Notes"
                {...register("releaseNote")}
              />
            </div>
          </form>
        </FormProvider>

        <div className={styles.actionButtonWrapper}>
          <Button color="light" onClick={toggle}>
            Cancel
          </Button>
          <Button color="info" form={formId} type="submit">
            Save Draft
          </Button>
        </div>
      </ModalDialog>

      <SaveDraftSuccess
        isOpen={showModalSuccess}
        toggle={() => setShowModalSuccess(!showModalSuccess)}
      />
    </>
  );
};

export default observer(SaveDraftDialog);
