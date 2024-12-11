/* eslint-disable max-lines */
import { Box, Divider, HStack, Text } from "@chakra-ui/react";
import cx from "classnames";
import Button from "components/Button";
import ModalDialog, { ModalDialogProps } from "components/ModalDialog";
import SvgIcon from "components/SvgIcon";
import { ErrorMessageEnum } from "constants/error";
import {
  ContentState,
  DefaultDraftBlockRenderMap,
  EditorState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import { useStores } from "hooks/useStores";
import Immutable from "immutable";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { IBlockWithRelations } from "interfaces/block";
import { observer } from "mobx-react";
import {
  clearOldDecisionPoint,
  createDecisionPoint,
  getRenderProcess,
} from "pages/ProcessDetailPage/utils";
import { getDefaultFormValues } from "pages/ProcessDetailPage/utils/formValue";
import { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getValidArray } from "utils/common";
import styles from "./blockTextEditor.module.scss";
import DecisionPoints from "./components/DecisionPoints";
import IconSection from "./components/IconSection";
import LinkedDialog from "./components/LinkedDialog";
import MediaModal from "./components/LinkedDialog/components/MediaModal";
import { toolbarOption } from "./constants";
import { BlockTextFormValues } from "./enums";
import { updateMediaById } from "API/media";
import draftToHtml from "draftjs-to-html";
import { BlockTextContentType } from "constants/process";
import { get } from "lodash";
import {
  createBlock,
  deleteBlockById,
  updateBlockById,
  upsertMedia,
} from "API/block";
import DeleteDialog from "components/DeleteDialog";

const blockRenderMap = Immutable.Map({
  unstyled: {
    element: "p", // Render 'unstyled' blocks as <p>
  },
  "unstyled-empty": {
    element: "p", // Render empty unstyled blocks as <p>
    aliasedElements: ["empty"],
    wrapper: <div className="empty-paragraph" />, // Optional: wrapper for empty paragraphs
  },
  "header-one": {
    element: "h1", // Render 'header-one' blocks as <h1>
  },
  "header-two": {
    element: "h2", // Render 'header-two' blocks as <h2>
  },
  blockquote: {
    element: "blockquote", // Render 'blockquote' blocks as <blockquote>
  },
  "empty-span": {
    element: "span", // Empty span blocks
    aliasedElements: ["empty"],
    wrapper: <span className="empty-span" />,
  },
  "unstyled-br": {
    element: "div", // Custom type to handle line breaks (<br>)
    wrapper: (
      <div>
        <br />
      </div>
    ), // Render a <div> with a <br> inside
  },
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

interface BlockTextEditorProps extends Omit<ModalDialogProps, "children"> {
  stepId: string;
  blockText?: IBlockWithRelations | null;
  step: IStepWithRelations;
  isEditMode: boolean;
  handleShowAutosave: () => void;
  handleShowManageMediaDialog: () => void;
  handleShowEmbedLinkModal: () => void;
}

const BlockTextEditor = ({
  blockText,
  step,
  isOpen,
  isEditMode,
  handleShowAutosave,
  handleShowManageMediaDialog,
  handleShowEmbedLinkModal,
  ...props
}: BlockTextEditorProps) => {
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      label: "",
      mediaList: [],
      mediaLabels: [],
      isDisableMediaLabel: false,
      iconId: "no-icon",
    },
  });
  const { getValues, reset, register } = methods;

  const { processStore } = useStores();
  const { process } = processStore;
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showDecisionPointDialog, setShowDecisionPointDialog] = useState(false);
  const [decisionPointIndex, setDecisionPointIndex] = useState<number>(-1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLinkInternalStep, setShowLinkInternalStep] = useState(false);
  const [showLinkExternalStep, setShowLinkExternalStep] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mediaLink, setMediaLink] = useState<IMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<IMedia[]>([]);
  const defaultTargetOption =
    (localStorage ? localStorage.getItem("defaultTargetOption") : "_blank") ||
    "_blank";
  const [defaultTarget, setDefaultTarget] =
    useState<string>(defaultTargetOption);

  useEffect(() => {
    if (blockText?._id && isOpen) {
      const content = String(blockText?.content).replace(
        /<p><\/p>/g,
        "<p>&nbsp;</p>"
      );
      const blocksFromHTML = convertFromHTML(
        content,
        undefined,
        extendedBlockRenderMap
      );
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      const blockMedias = getValidArray(blockText?.blockMedias).map(
        (blockMedia) =>
          (blockMedia?.media as IMedia[])?.[0] ?? blockMedia?.media
      );
      setEditorState(EditorState.createWithContent(contentState));
      setMediaLink(blockMedias);
      setSelectedMedia(blockMedias);
    }
  }, [blockText?._id, isOpen]);

  useEffect(() => {
    getDefaultFormValues(reset, blockText as IBlockWithRelations);
  }, [blockText, isOpen]);

  useEffect(() => {
    register(BlockTextFormValues.ICON_ID);
  }, [register]);

  async function handleUpdateBlock(): Promise<void> {
    setLoading(true);
    const mediaLabels: IMedia[] =
      getValues(BlockTextFormValues.MEDIA_LABELS) ?? [];
    const isDisableMediaLabel: boolean =
      getValues("isDisableMediaLabel") ?? false;
    const mediaIds: string[] = getValidArray(mediaLink).map(
      (media) => media?._id ?? media?.id
    );
    const blockId: string = blockText?._id ?? blockText?.id ?? "";

    if (mediaLabels?.length > 0) {
      await Promise.all(
        getValidArray(mediaLabels).map((media) => {
          return updateMediaById(media?._id ?? media?.id, {
            name: media?.name,
          });
        })
      );
    }

    await updateBlockById(blockId, {
      content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      // iconId: Number(get(getValues(), `${BlockTextFormValues.ICON_ID}`, 0)),
      isDisableMediaLabel,
    });
    await upsertMedia(blockId, mediaIds);
    await clearOldDecisionPoint(blockText as IBlockWithRelations);
    await createDecisionPoint(getValues, blockId);
    await handleShowAutosave();
    if (props.onClose) {
      props.onClose();
    }
    getRenderProcess(process.id ?? "", processStore);
    setLoading(false);
  }

  async function handleCreateBlock(): Promise<void> {
    setLoading(true);
    try {
      const mediaIds: string[] = getValidArray(mediaLink).map(
        (media) => media?._id ?? media?.id
      );
      const mediaLabels: IMedia[] =
        getValues(BlockTextFormValues.MEDIA_LABELS) ?? [];
      const isDisableMediaLabel: boolean =
        getValues("isDisableMediaLabel") ?? false;

      if (mediaLabels?.length > 0) {
        await Promise.all(
          getValidArray(mediaLabels).map((media) => {
            return updateMediaById(media?._id ?? media?.id, {
              name: media?.name,
            });
          })
        );
      }
      const newBlock = await createBlock({
        type: BlockTextContentType.TEXT_BLOCK,
        content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        stepId: step?.id ?? "",
        position: Array.isArray(step?.blocks) ? step?.blocks?.length + 1 : 0,
        // iconId: get(getValues(), `${BlockTextFormValues.ICON_ID}`, 0),
        isDisableMediaLabel,
      });
      await upsertMedia(newBlock?.id ?? "", mediaIds);
      await clearOldDecisionPoint(newBlock as IBlockWithRelations);
      await createDecisionPoint(getValues, newBlock?.id ?? "");
      await handleShowAutosave();
      if (props.onClose) {
        props.onClose();
      }
      getRenderProcess(process.id ?? "", processStore);
    } catch (error: any) {
      toast.error(ErrorMessageEnum.TECHNICAL_ERROR);
    }
    setLoading(false);
  }

  async function handleDeleteBlock(): Promise<void> {
    await clearOldDecisionPoint(blockText as IBlockWithRelations);
    await deleteBlockById(blockText?._id ?? blockText?.id ?? "");
    await handleShowAutosave();
    setShowDeleteDialog(false);
    if (props.onClose) {
      props.onClose();
    }
    getRenderProcess(process.id ?? "", processStore);
  }

  function handleSaveMediaLinks(): void {
    setMediaLink(selectedMedia);
  }

  useEffect(() => {
    if (showMediaGallery) {
      setSelectedMedia(mediaLink);
    }
  }, [showMediaGallery]);

  // useEffect(() => {
  //   iconBuilderStore.fetchBlockIconList();
  // }, []);

  return (
    <FormProvider {...methods}>
      <ModalDialog
        size="lg"
        title={isEditMode ? "Edit block" : "Add new block"}
        headerClassName={styles.dialogHeader}
        bodyClassName={styles.dialogBody}
        isOpen={isOpen}
        backdrop="static"
        {...props}
      >
        <Box marginX={6} className={styles.editDialog}>
          <div>
            <Box marginBottom={3}>
              <Text as="b" color="gray.700" fontSize="md">
                Block Content
              </Text>
            </Box>
            <Editor
              editorState={editorState}
              onChange={(state) => console.log(state)}
              editorClassName={styles.editBox}
              onEditorStateChange={(state) => setEditorState(state)}
              spellCheck
              hashtag={{
                separator: " ",
                trigger: "#",
              }}
              toolbar={{
                ...toolbarOption,
                link: {
                  defaultTargetOption: defaultTarget,
                  linkCallback: (params: {
                    targetOption: string;
                    title: string;
                    target: string;
                  }) => {
                    localStorage.setItem(
                      "defaultTargetOption",
                      params?.targetOption
                    );
                    setDefaultTarget(params?.targetOption ?? "_blank");
                    return {
                      ...params,
                      target: params?.target.includes("https")
                        ? params?.target
                        : `https://${params?.target}`,
                    };
                  },
                },
              }}
            />
          </div>
          <DecisionPoints
            setShowMediaGallery={setShowMediaGallery}
            showDecisionPointDialog={showDecisionPointDialog}
            setShowDecisionPointDialog={setShowDecisionPointDialog}
            setDecisionPointIndex={setDecisionPointIndex}
            setShowLinkInternalStep={setShowLinkInternalStep}
            setShowLinkExternalStep={setShowLinkExternalStep}
            step={step}
            mediaLink={mediaLink}
            setMediaLink={setMediaLink}
            blockText={blockText}
          />
          <IconSection />
        </Box>
        <Divider />
        <div className={cx(styles.actionButtons)}>
          <HStack
            width={"full"}
            display={"flex"}
            justifyContent={isEditMode ? "space-between" : "flex-end"}
          >
            {isEditMode && (
              <Button
                background="red"
                color="white"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Block
              </Button>
            )}

            <HStack
              className={cx({ [styles.saveGroup]: !isEditMode })}
              display="flex"
              justifyContent={"flex-end"}
            >
              <Button
                color="gray.700"
                background="white"
                border="1px solid #E2E8F0"
                onClick={(e) => {
                  e.preventDefault();
                  props.onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                color="white"
                onClick={() => {
                  if (isEditMode) {
                    handleUpdateBlock();
                  }
                  if (!isEditMode) {
                    handleCreateBlock();
                  }
                }}
                disabled={loading}
              >
                {isEditMode ? "Save" : "Add"}
              </Button>
            </HStack>
          </HStack>
        </div>
        <LinkedDialog
          textContentId={blockText?._id ?? blockText?.id ?? ""}
          isOpen={showDecisionPointDialog}
          setShowDecisionPointDialog={setShowDecisionPointDialog}
          isOpenLinkInternalStep={showLinkInternalStep}
          isOpenLinkExternalStep={showLinkExternalStep}
          setShowLinkInternalStep={setShowLinkInternalStep}
          setShowLinkExternalStep={setShowLinkExternalStep}
          step={step}
          decisionPointIndex={decisionPointIndex}
          handleShowManageMediaDialog={handleShowManageMediaDialog}
          handleShowEmbedLinkModal={handleShowEmbedLinkModal}
          children={undefined}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
        <MediaModal
          step={step}
          isOpen={showMediaGallery}
          onClose={() => setShowMediaGallery(false)}
          linkedMedia={selectedMedia}
          setLinkedMedia={setSelectedMedia}
          handleSave={handleSaveMediaLinks}
          handleShowManageMediaDialog={handleShowManageMediaDialog}
          handleShowEmbedLinkModal={handleShowEmbedLinkModal}
        />
        <DeleteDialog
          title="Delete Block"
          isOpen={showDeleteDialog}
          message="Are you sure you want to DELETE this Block?"
          toggle={() => setShowDeleteDialog(false)}
          onDelete={handleDeleteBlock}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Yes, Delete"
        />
      </ModalDialog>
    </FormProvider>
  );
};

export default observer(BlockTextEditor);
