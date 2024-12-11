/* eslint-disable max-lines */
import { Box, Center, HStack, Stack, Text, VStack } from "@chakra-ui/react";
// import { uploadFile } from "API/cms";
// import { createMedia, updateMediaById } from "API/media";
// import { updateTextContentById } from "API/textContent";
import cx from "classnames";
import Icon from "components/Icon";
import MediaManager, {
  MediaFileType,
  MEDIATYPES,
} from "components/MediaManager";
import ProcessMediaTab from "components/ProcessMediaTab";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { IBlockWithRelations } from "interfaces/block";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { getRenderProcess } from "pages/ProcessDetailPage/utils/process";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Card, CardBody, CardText, Collapse, Row } from "reactstrap";
import { primary500 } from "themes/globalStyles";
import { checkValidArray, getValidArray } from "utils/common";
import BlockTextEditor from "./components/BlockTextEditor";
import EmbedLinkModal from "./components/BlockTextEditor/components/EmbedLinkModal";
import CardHeader from "./components/CardHeader";
import DropZone from "./components/DropZone";
import MediaView from "./components/MediaView";
import TaskCard from "./components/TaskCard";
import styles from "./stepCard.module.scss";
import { OutlineButton, UploadButton } from "./stepCard.styles";
import { uploadFile } from "API/cms";
import { UpdateBody } from "types/common";
import { createMedia, updateMediaById } from "API/media";
import { updateBlockById } from "API/block";

interface IStepCardProps {
  lastStep: boolean;
  step: IStepWithRelations;
  isCommonStepFromStepId?: string;
  onToggleMessageView?: Function;
  procedureId: string;
  isStartEditing: boolean;
  isDragging: boolean;
  setDisabledButtonPublishDraft: (value: string) => void;
  handleShowAutosave: () => void;
  canEditProcess: boolean;
  searchText?: string;
  alwayExpand?: boolean;
}

const StepCard = ({
  step,
  lastStep,
  searchText,
  procedureId,
  isStartEditing,
  isDragging,
  setDisabledButtonPublishDraft,
  handleShowAutosave,
  onToggleMessageView = () => {},
  canEditProcess,
  alwayExpand,
  isCommonStepFromStepId,
}: IStepCardProps) => {
  const { processStore, organizationStore } = useStores();
  const [isEditing, setIsEditing] = useState(false);
  const [showEditStep, setShowEditStep] = useState(false);
  const [showAddTextBlock, setShowAddTextBlock] = useState<boolean>(false);
  const [isEditingMedia, setIsEditingMedia] = useState<boolean>(false);
  const [editingBlockText, setEditingBlockText] =
    useState<IBlockWithRelations | null>(null);
  const [showManageMediaDialog, setShowManageMediaDialog] = useState(false);
  const [showEmbedLinkModal, setShowEmbedLinkModal] = useState<boolean>(false);

  const { expandingSteps } = processStore;
  const isManageMode = processStore?.isManageModeInDetail;

  const isOpen = expandingSteps.includes(step.id ?? "");
  const [blocks, setBlocks] = useState<IBlockWithRelations[]>([]);
  const [sequenceChanged, setSequenceChanged] = useState(false);

  const mediaList: IMedia[] = step?.media || [];
  const [selectedMedia, setSelectedMedia] = useState<IMedia>(
    mediaList[0] ? mediaList[0] : ({} as IMedia)
  );
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  const hasMedia: boolean = checkValidArray(mediaList);
  const hasBlocks: boolean = checkValidArray(step?.blocks);

  useEffect(() => {
    setBlocks(step?.blocks ?? []);
    if (step?.icon) {
      // iconBuilderStore.setSelectedIcon(step.icon);
    }

    if (alwayExpand) {
      processStore.setExpandingSteps([...expandingSteps, step.id ?? ""]);
    }
  }, [step]);

  useEffect(() => {
    if (isStartEditing) {
      setIsEditing(true);
      setShowEditStep(false);
      !isOpen && toggleExpand();
    }
  });

  useEffect(() => {
    if (!isManageMode) {
      setIsEditing(false);
    }
  }, [isManageMode]);

  async function handleFinishEditing(): Promise<void> {
    setIsEditing(false);
    setDisabledButtonPublishDraft(step?._id ?? step?.id ?? "");
    if (sequenceChanged) {
      await Promise.all(
        blocks.map((block, idx) => {
          return updateBlockById(block?._id ?? block?.id, {
            position: idx + 1,
          });
        })
      );
      setSequenceChanged(false);
      if (step.processId) {
        getRenderProcess(step.processId, processStore);
      }
    }
  }

  const reorder = (
    list: IBlockWithRelations[],
    startIndex: number,
    endIndex: number
  ): IBlockWithRelations[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  function toggleExpand(): void {
    if (isOpen) {
      const currentStepIndex = expandingSteps.findIndex(
        (expandingId) => expandingId === step.id
      );
      let newExpandedSteps = [...expandingSteps];
      newExpandedSteps.splice(currentStepIndex, 1);
      processStore.setExpandingSteps(newExpandedSteps);
    } else {
      processStore.setExpandingSteps([...expandingSteps, step.id ?? ""]);
    }
  }

  function handleOpenMediaManager(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.stopPropagation();
    setShowManageMediaDialog(true);
  }

  function handleOpenEmbedLinkModal(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.stopPropagation();
    setShowEmbedLinkModal(true);
  }

  async function uploadMedia(
    fileToUpload: File,
    setUploadProgress: (percent: number) => any
  ) {
    const category: any = fileToUpload.type.split("/")[0];
    const fileType = [MediaFileType.IMAGE, MediaFileType.VIDEO].includes(
      category
    )
      ? category
      : MediaFileType.FILE;

    const url = await uploadFile(
      organizationStore.organization?.id ?? "",
      fileType,
      fileToUpload,
      (data: any) => {
        setUploadProgress(Math.round((100 * data.loaded) / data.total));
      }
    );

    if (url) {
      const mediaBody: UpdateBody<IMedia> = {
        organizationId: organizationStore.organization?.id,
        position: mediaList.length + 1,
        mediaType: MEDIATYPES[fileType].mediaType,
        stepId: step?.id,
        url,
        [MEDIATYPES[fileType].column]: url.split("/").pop(),
        originalFile: fileToUpload?.name,
      };

      await createMedia(mediaBody);
      getRenderProcess(processStore.process.id, processStore);
    }
  }

  async function handleChangeCaption(mediaId: string, caption: string) {
    await updateMediaById(mediaId, { name: caption });
    await getRenderProcess(processStore.process.id ?? "", processStore);
  }

  return (
    <Row className={cx(styles.container, isDragging && styles.isDragging)}>
      <CardHeader
        canEditProcess={canEditProcess}
        onClick={alwayExpand ? () => {} : toggleExpand}
        position={step.position}
        name={step.name}
        isEditing={isEditing}
        mediaList={mediaList}
        searchText={searchText}
        step={step}
        isCommonStepFromStepId={isCommonStepFromStepId}
        lastStep={lastStep}
        onStartEditing={() => {
          setIsEditing(true);
          setShowEditStep(false);
          !isOpen && toggleExpand();
          setDisabledButtonPublishDraft(step.id ?? "");
        }}
        onStopEditing={handleFinishEditing}
        onToggleMessageView={onToggleMessageView}
        procedureId={procedureId}
        handleShowAutosave={() => handleShowAutosave()}
        className={styles.cardHeader}
        isCollapsed={!isOpen}
      />
      {isEditing && !hasBlocks && !hasMedia && (
        <VStack width="full" padding={6} spacing={3}>
          <DropZone
            step={step}
            organizationId={organizationStore.organization?.id ?? ""}
            fetchData={() =>
              getRenderProcess(step?.processId ?? "", processStore)
            }
          >
            <VStack>
              <Text
                color="gray.500"
                fontSize="sm"
                fontWeight={500}
                lineHeight={5}
              >
                Paste, drag or upload files.
              </Text>
              <HStack>
                <UploadButton fontSize="sm" onClick={handleOpenMediaManager}>
                  <SvgIcon iconName="file-upload" size={14} color="gray.600" />
                  Upload files
                </UploadButton>
                <UploadButton fontSize="sm" onClick={handleOpenEmbedLinkModal}>
                  <SvgIcon iconName="insert-link" size={14} color="gray.600" />
                  Embed link
                </UploadButton>
              </HStack>
            </VStack>
          </DropZone>
          <HStack spacing={3}>
            <Box width="42px" height="1px" background="gray.300" />
            <Text color="gray.500" fontWeight={500} lineHeight={6}>
              OR
            </Text>
            <Box width="42px" height="1px" background="gray.300" />
          </HStack>
          <OutlineButton
            width={{ base: "full", md: "initial" }}
            color={currentTheme?.primaryColor ?? primary500}
            border={`1px solid ${currentTheme?.primaryColor ?? primary500}`}
            _hover={{
              color: "white",
              background: `${currentTheme?.primaryColor ?? primary500}`,
            }}
            onClick={() => setShowAddTextBlock(true)}
          >
            + Add new block
          </OutlineButton>
        </VStack>
      )}
      {hasBlocks || hasMedia ? (
        <Collapse isOpen={isOpen} className={styles.collapse}>
          <Stack
            width="full"
            height="full"
            align="flex-start"
            justify="space-between"
            borderTop="1px solid #E2E8F0"
            flexDirection={{ base: "column", md: "row" }}
            spacing={0}
          >
            <VStack
              width="full"
              align="flex-start"
              padding={{ base: 4, sm: 6 }}
              spacing={3}
            >
              {hasMedia && !hasBlocks ? (
                <VStack width="full" spacing={3}>
                  <MediaView
                    mediaList={mediaList}
                    setSelectedMedia={setSelectedMedia}
                    mediaIndex={getValidArray(mediaList).findIndex(
                      (media) => media?.id === selectedMedia?.id
                    )}
                    isEditingMedia={isEditingMedia}
                  />
                  {isEditing && (
                    <HStack spacing={3}>
                      <Box width="42px" height="1px" background="gray.300" />
                      <Text color="gray.500" fontWeight={500} lineHeight={6}>
                        OR
                      </Text>
                      <Box width="42px" height="1px" background="gray.300" />
                    </HStack>
                  )}
                </VStack>
              ) : (
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) {
                      return;
                    }
                    const items = reorder(
                      blocks,
                      result.source.index,
                      result.destination.index
                    );
                    setBlocks(items);
                    items.forEach(
                      (block: IBlockWithRelations, index: number) => {
                        updateBlockById(block?._id ?? block?.id ?? '', {
                          position: index + 1,
                        });
                      }
                    );
                    setSequenceChanged(true);
                  }}
                >
                  <Droppable
                    droppableId="droppable"
                    isDropDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <div
                        style={
                          snapshot.isDraggingOver
                            ? {
                                background: "#EEE",
                                height: "100%",
                                width: "100%",
                              }
                            : { width: "100%" }
                        }
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {Array.isArray(blocks) &&
                          blocks.map(
                            (block: IBlockWithRelations, index: number) => (
                              <Draggable
                                key={`block-${block?.id ?? block?._id}`}
                                draggableId={`${block?.id ?? block?._id}`}
                                index={index}
                                isDragDisabled={!isEditing}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                    style={{
                                      ...provided.draggableProps.style,
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      background: "#FFFFFF",
                                      boxShadow: snapshot.isDragging
                                        ? "0px 6px 6px rgba(0, 0, 0, 0.08)"
                                        : "initial",
                                    }}
                                    className={
                                      isEditing
                                        ? styles.dragAbleBlock
                                        : undefined
                                    }
                                    onClick={() => {
                                      setShowEditStep(true);
                                      setEditingBlockText(block);
                                    }}
                                  >
                                    {isEditing && (
                                      <Icon
                                        icon="grip-vertical"
                                        group="fontawesome"
                                      />
                                    )}
                                    <div
                                      className={cx(
                                        styles.cardFullWidth,
                                        styles.cardSpacingRight,
                                        {
                                          [styles.cardSpacingLeft]: !isEditing,
                                        }
                                      )}
                                    >
                                      <TaskCard
                                        key={`taskCard-${
                                          block?.id ?? block?._id
                                        }`}
                                        task={block}
                                        isEditing={isEditing}
                                        mediaList={mediaList}
                                        selectedMedia={selectedMedia}
                                        setSelectedMedia={setSelectedMedia}
                                      />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            )
                          )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
              <Center width="full">
                {isEditing && (
                  <OutlineButton
                    width={{ base: "full", md: "initial" }}
                    color={currentTheme?.primaryColor ?? primary500}
                    border={`1px solid ${
                      currentTheme?.primaryColor ?? primary500
                    }`}
                    _hover={{
                      color: "white",
                      background: `${currentTheme?.primaryColor ?? primary500}`,
                    }}
                    onClick={() => setShowAddTextBlock(true)}
                  >
                    + Add new block
                  </OutlineButton>
                )}
              </Center>
            </VStack>
            {(isEditing || (!isEditing && hasMedia)) && (
              <Box
                maxWidth={{ md: "212px" }}
                width="full"
                height="full"
                borderLeft="2px solid #E2E8F0"
              >
                <ProcessMediaTab
                  isEditing={isEditing}
                  setShowManageMediaDialog={setShowManageMediaDialog}
                  mediaList={mediaList}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  step={step}
                  hasBlocks={hasBlocks}
                  isOpenEmbedLinkModal={showEmbedLinkModal}
                  closeEmbedLinkModal={() => setShowEmbedLinkModal(false)}
                  isEditingMedia={isEditingMedia}
                  setIsEditingMedia={setIsEditingMedia}
                />
              </Box>
            )}
          </Stack>
        </Collapse>
      ) : (
        !isEditing && (
          <Collapse className={styles.collapse} isOpen={isOpen}>
            <CardText margin={{ base: 4, sm: 6 }}>Empty step</CardText>
          </Collapse>
        )
      )}
      {isEditing && (
        <BlockTextEditor
          isOpen={showEditStep}
          onClose={() => setShowEditStep(!showEditStep)}
          stepId={step?.id || ""}
          blockText={editingBlockText}
          step={step}
          isEditMode
          handleShowAutosave={() => handleShowAutosave()}
          handleShowManageMediaDialog={() => setShowManageMediaDialog(true)}
          handleShowEmbedLinkModal={() => setShowEmbedLinkModal(true)}
        />
      )}
      {showAddTextBlock && (
        <BlockTextEditor
          isOpen={showAddTextBlock}
          onClose={() => setShowAddTextBlock(false)}
          stepId={step.id || ""}
          step={step}
          isEditMode={false}
          handleShowAutosave={() => handleShowAutosave()}
          handleShowManageMediaDialog={() => setShowManageMediaDialog(true)}
          handleShowEmbedLinkModal={() => setShowEmbedLinkModal(true)}
        />
      )}
      <MediaManager
        onUpdateCaption={handleChangeCaption}
        onFileUpload={uploadMedia}
        onClose={() => setShowManageMediaDialog(!showManageMediaDialog)}
        isOpen={showManageMediaDialog}
        mediaList={mediaList}
        handleShowAutosave={() => handleShowAutosave()}
      />
      <EmbedLinkModal
        isOpen={showEmbedLinkModal}
        onClose={() => setShowEmbedLinkModal(false)}
        step={step}
        mediaList={mediaList}
      />
    </Row>
  );
};

export default observer(StepCard);
