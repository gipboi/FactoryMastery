import cx from "classnames";
import { useStores } from "hooks/useStores";
import { useState } from "react";
// import { getEcnSuggestions } from 'API/ecnSuggestion'
// import { createEcnSuggestion, createEcnSuggestionAttachment } from 'API/ecnSuggestion'
import ProcedureIcon from "components/Common/ProcedureIcon";
import ModalDialog, { ModalDialogProps } from "components/ModalDialog";
import SvgIcon from "components/SvgIcon";
import Tabs, { ITabContent, ITabHeader } from "components/Tabs";
import { AuthRoleNameEnum } from "constants/user";
import { IEcnSuggestionWithRelations } from "interfaces/ecnSuggestion";
import MessageContent from "../MessageView/components/Content";
import styles from "./messageView.module.scss";
import { Attachement } from "./types";
import IconBuilder from "components/IconBuilder";
import { stepIcon } from "components/Icon";

interface MessageViewProps
  extends Omit<ModalDialogProps, "title" | "size" | "headerClassName"> {
  stepId: string;
  stepName?: string;
}

const MessageView = ({ stepId, stepName, ...props }: MessageViewProps) => {
  const { processStore, userStore, notificationStore, authStore } = useStores();
  const { userDetail } = authStore;
  const { process } = processStore;
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER; // Use name instead of id
  // const collections = Array.isArray(process?.collections)
  //   ? process?.collections
  //   : [];
  const [ecnSuggestions, setEcnSuggestions] = useState<
    IEcnSuggestionWithRelations[]
  >([]);
  const [ecnSuggestionsForAdmin, setEcnSuggestionsForAdmin] = useState<
    IEcnSuggestionWithRelations[]
  >([]);

  // async function fetchEcnSuggestions() {
  //   const result = await getEcnSuggestions({
  //     where: { stepId: stepId, isAdminOnly: false },
  //     order: ["createdAt ASC"],
  //     include: [{ relation: "user" }, { relation: "ecnSuggestionAttachments" }],
  //   });
  //   setEcnSuggestions(result);
  // }

  // async function fetchEcnSuggestionsForAdmin() {
  //   const result = await getEcnSuggestions({
  //     where: { stepId: stepId, isAdminOnly: true },
  //     order: ["createdAt ASC"],
  //     include: [{ relation: "user" }, { relation: "ecnSuggestionAttachments" }],
  //   });
  //   setEcnSuggestionsForAdmin(result);
  // }

  // useEffect(() => {
  //   fetchEcnSuggestions();
  //   !isBasicUser && fetchEcnSuggestionsForAdmin();
  // }, [stepId]);

  async function handleSendMessage(
    stepId: string,
    comment: string,
    attachments: Attachement[],
    isAdminOnly?: boolean,
    callback?: (isSuccess: boolean) => any
  ) {
    if (userStore.currentUser && stepId && comment) {
      // const createdEcn = await createEcnSuggestion({
      //   stepId: stepId,
      //   userId: userStore.currentUser.id,
      //   createdAt: dayjs().toDate(),
      //   updatedAt: dayjs().toDate(),
      //   isAdminOnly,
      //   comment,
      // });
      // notificationStore.aggregateCountNotifications();

      // if (Array.isArray(attachments) && attachments.length > 0) {
      //   await Promise.all(
      //     attachments.map((attach) =>
      //       createEcnSuggestionAttachment({
      //         createdAt: dayjs().toDate(),
      //         updatedAt: dayjs().toDate(),
      //         ecnSuggestionId: createdEcn.id,
      //         attachment: attach.url.split("/").pop(),
      //         originalFile: attach.name,
      //       })
      //     )
      //   );
      // }

      // fetchEcnSuggestions();
      // !isBasicUser && fetchEcnSuggestionsForAdmin();

      callback && callback(true);
    } else {
      callback && callback(false);
    }
  }

  const headers: ITabHeader[] = [
    {
      label: "USER",
      tabId: "user",
    },
    {
      label: "ADMIN",
      tabId: "admin",
    },
  ];

  const contents: ITabContent[] = [
    {
      tabId: "user",
      content: (
        <MessageContent
          messages={ecnSuggestions}
          stepId={stepId}
          onSendMessage={(stepId, comment, attachments, callback) =>
            handleSendMessage(stepId, comment, attachments, false, callback)
          }
        />
      ),
    },
    {
      tabId: "admin",
      content: (
        <MessageContent
          messages={ecnSuggestionsForAdmin}
          stepId={stepId}
          onSendMessage={(stepId, comment, attachments, callback) =>
            handleSendMessage(stepId, comment, attachments, true, callback)
          }
        />
      ),
    },
  ];

  return (
    <ModalDialog
      title="Leave Comment"
      className={styles.commentModal}
      headerClassName={styles.commentModalHeader}
      size="lg"
      // isOpen={!!stepId}
      {...props}
    >
      {/* {collections.length > 0 && (
        <div className={styles.headerItems}>
          <SvgIcon size={20} iconName="collections" />
          <span>
            {collections?.length === 1
              ? collections[0].name
              : "Multiple collections"}
          </span>
        </div>
      )} */}
      <div className={cx(styles.headerItems, styles.processName)}>
        <ProcedureIcon procedureIcon={process.procedureIcon} size={20} />
        <span>{process?.name}</span>
      </div>
      <div className={cx(styles.headerItems, styles.stepName)}>
        <IconBuilder icon={stepIcon} size={40} isActive />
        <span>{stepName}</span>
      </div>
      {isBasicUser ? (
        <>
          <br />
          <MessageContent
            messages={ecnSuggestions}
            stepId={stepId}
            onSendMessage={(stepId, comment, attachments, callback) =>
              handleSendMessage(stepId, comment, attachments, false, callback)
            }
          />
        </>
      ) : (
        <Tabs headers={headers} contents={contents} />
      )}
    </ModalDialog>
  );
};

export default MessageView;
