/* eslint-disable max-lines */
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { uploadFile } from "API/cms";
import { createMedia, updateMediaById } from "API/media";
import { deleteStepById, updateStepById } from "API/step";
import cx from "classnames";
import DeleteDialog from "components/DeleteDialog";
import { stepIcon } from "components/Icon";
import IconBuilder from "components/IconBuilder";
import InlineTextField from "components/InlineTextField";
import MediaManager, {
  MediaFileType,
  MEDIATYPES,
} from "components/MediaManager";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { getRenderProcess } from "pages/ProcessDetailPage/utils/process";
import React, { MouseEventHandler, useMemo, useState } from "react";
import Highlighter from "react-highlight-words";
import { Col } from "reactstrap";
import colors from "themes/colors.theme";
import { UpdateBody } from "types/common";
import styles from "./cardHeader.module.scss";
import ModalAddStep from "./components/ModalAddStep";

interface ICardHeaderProps {
  name?: string;
  position?: number;
  onClick: () => void;
  onStartEditing?: MouseEventHandler<any>;
  onStopEditing?: MouseEventHandler<any>;
  onToggleMessageView?: Function;
  mediaList: IMedia[];
  step: IStepWithRelations;
  isCommonStepFromStepId?: string;
  isEditing: boolean;
  lastStep: boolean;
  procedureId: string;
  className?: string;
  searchText?: any;
  handleShowAutosave: () => void;
  canEditProcess: boolean;
  isCollapsed: boolean;
}

const CardHeader = ({
  name,
  position,
  searchText,
  step,
  onClick,
  handleShowAutosave,
  onStartEditing = () => {},
  onStopEditing = () => {},
  onToggleMessageView = () => {},
  isEditing,
  lastStep,
  procedureId,
  className,
  canEditProcess,
  isCollapsed,
  ...props
}: ICardHeaderProps) => {
  const {
    processStore,
    organizationStore,
    // iconBuilderStore,
    authStore,
    commonLibraryStore,
  } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const [showManageMediaDialog, setShowManageMediaDialog] = useState(false);
  const [showModalAddStep, setShowModalAddStep] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isProcessArchived =
    processStore?.process?.archivedAt &&
    processStore?.process?.archivedAt !== null;
  const isManageMode = processStore?.isManageModeInDetail;
  const { userDetail } = authStore;
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER; // Use name instead of id
  const [isEditStepName, setIsEditStepName] = useState<boolean>(false);
  const isCommonStepFromStepId = commonLibraryStore?.isFeatureEnabled
    ? props.isCommonStepFromStepId
    : undefined;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function handleDeleteStep(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setDeleteStepId(step.id);
  }

  function handleRemoveCommonStep(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    isCommonStepFromStepId && setDeleteStepId(isCommonStepFromStepId);
  }

  async function handleDeleteStepConfirmed(): Promise<void> {
    await deleteStepById(deleteStepId ?? "");
    if (processStore.process) {
      setDeleteStepId("");
      getRenderProcess(processStore.process.id ?? "", processStore);
      handleShowAutosave();
    }
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
        position: props.mediaList.length + 1,
        mediaType: MEDIATYPES[fileType].mediaType,
        stepId: step.id,
        url,
        [MEDIATYPES[fileType].column]: url.split("/").pop(),
        originalFile: fileToUpload.name,
      };

      await createMedia(mediaBody);
      //
      getRenderProcess(processStore.process.id, processStore);
    }
  }

  async function handleChangeCaption(mediaId: string, caption: string) {
    await updateMediaById(mediaId, { name: caption });
    await getRenderProcess(processStore.process.id ?? "", processStore);
  }

  const contents: string = useMemo(() => {
    return Array.isArray(step?.blocks)
      ? step.blocks.map((block) => block?.content ?? "").join(" ")
      : "";
  }, [step.blocks]);

  const searchIndex: number = String(searchText)
    .toLowerCase()
    .split(" ")
    .reduce((result, currentValue) => {
      const index: number = contents.toLowerCase().indexOf(currentValue);
      if (index > -1 && (index < result || result < 0)) {
        return index;
      }
      return result;
    }, -1);

  const textToHighlight: string = useMemo(() => {
    const maxStart: number = [
      searchIndex - 10,
      searchIndex - 20,
      searchIndex - 30,
      searchIndex,
      0,
    ].reduce((result, currentValue) => {
      if (
        currentValue > 0 &&
        currentValue < result &&
        currentValue < searchIndex
      ) {
        return currentValue;
      }
      return result;
    }, searchIndex);
    const sliceStart: number =
      contents.slice(maxStart, searchIndex).indexOf(" ") + maxStart + 1;
    const sliceEnd: number =
      contents
        .slice(sliceStart + Math.max(60, contents.length - sliceStart))
        .indexOf(" ") +
      sliceStart +
      60;

    return contents.slice(sliceStart, sliceEnd).replace(/<[^>]*>?/gm, " ");
  }, [contents, searchIndex, searchText]);

  async function onSelect(iconId: string): Promise<void> {
    // await updateStepById(step.id, { iconId });
    getRenderProcess(processStore.process.id ?? "", processStore);
    onClose();
  }

  async function handleEditStepName(newTitle: string) {
    if (newTitle) {
      await updateStepById(step?.id ?? "", {
        name: newTitle,
      }).then(() =>
        getRenderProcess(processStore.process.id ?? "", processStore)
      );
    }
  }

  // useEffect(() => {
  //   if (isEditing) {
  //     iconBuilderStore.fetchStepIconList();
  //   }
  // }, [isEditing]);

  return (
    <Col
      xl="12"
      lg="12"
      md="12"
      sm="12"
      xs="12"
      className={cx(
        styles.container,
        className,
        commonLibraryStore?.isFeatureEnabled && {
          [styles.commonStep]: !!isCommonStepFromStepId,
          [styles.mainCommonStep]:
            step?.commonLibrary && step?.commonLibrary?.stepId === step?.id,
        }
      )}
      onClick={onClick}
    >
      <VStack width="full" align="flex-start" paddingX={{ base: 2, md: 0 }}>
        <HStack width="full">
          <div className={styles.layout}>
            <div className={styles.stepIcon}>
              {step.iconId ? (
                <IconBuilder icon={step.icon} size={32} isActive />
              ) : (
                <IconBuilder icon={stepIcon} size={32} isActive />
              )}
              {isEditing && isManageMode && (
                <SvgIcon
                  iconName="edit-hover-button"
                  className={styles.editButton}
                  onClick={onOpen}
                />
              )}
            </div>
            <div className={styles.label}>
              {!isMobile && (
                <Box
                  onClick={
                    isEditing
                      ? (event) => {
                          event.stopPropagation();
                          setIsEditStepName(true);
                        }
                      : undefined
                  }
                  flexDirection="row"
                  display="flex"
                >
                  <Text margin={0} alignSelf="center">
                    {position}.
                  </Text>
                  {isEditStepName && isEditing ? (
                    <InlineTextField
                      value={name}
                      onApplyChange={handleEditStepName}
                      editFirst
                      onStartEdit={() => setIsEditStepName(true)}
                      onStopEdit={() => setIsEditStepName(false)}
                    />
                  ) : (
                    <Text
                      margin={0}
                      onClick={
                        isEditing ? () => setIsEditStepName(true) : undefined
                      }
                    >
                      {name}
                    </Text>
                  )}
                </Box>
              )}

              {searchText && isCollapsed && searchIndex > -1 && (
                <VStack>
                  <Highlighter
                    class={cx(styles.title)}
                    highlightClassName={styles.highlight}
                    searchWords={[
                      ...String(searchText).toUpperCase().split(" "),
                      ...String(searchText).toLowerCase().split(" "),
                    ]}
                    autoEscape
                    textToHighlight={textToHighlight}
                  />
                </VStack>
              )}
            </div>
          </div>

          {canEditProcess && !isProcessArchived && (
            <div className={styles.editGroup}>
              {isEditing ? (
                <>
                  <Button
                    gap={{ base: 0, md: 2 }}
                    width={{ base: 10, md: "initial" }}
                    paddingX={{ base: 0, md: 4 }}
                    variant="outline"
                    background="white"
                    borderRadius="6px"
                    borderColor="red"
                    color="red"
                    fontWeight={500}
                    fontSize={{ base: 0, md: "16px" }}
                    lineHeight="24px"
                    marginTop="8px"
                    className={styles.deleteButton}
                    _hover={{ background: "red.500", color: "white" }}
                    _active={{ background: "red.500", color: "white" }}
                    onClick={handleDeleteStep}
                    disabled={lastStep}
                  >
                    <SvgIcon iconName="trash-red" size={16} />
                    Delete
                  </Button>

                  <Button
                    gap={{ base: 0, md: 2 }}
                    width={{ base: 10, md: "initial" }}
                    paddingX={{ base: 0, md: 4 }}
                    variant="outline"
                    borderRadius="6px"
                    color="white"
                    fontWeight={500}
                    margin="8px"
                    marginRight="0px"
                    fontSize={{ base: 0, md: "16px" }}
                    lineHeight="24px"
                    background={currentTheme?.primaryColor ?? "primary.500"}
                    _hover={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    _active={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    _focus={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopEditing(e);
                      handleShowAutosave();
                    }}
                  >
                    <SvgIcon iconName="ic_save" size={16} />
                    Done
                  </Button>
                </>
              ) : (
                <>
                  {!isBasicUser && (
                    <Tooltip
                      label="Note"
                      height="36px"
                      fontSize="14px"
                      padding={2}
                      background="gray.700"
                      placement="top"
                      color="white"
                      hasArrow
                      borderRadius="4px"
                    >
                      <IconButton
                        variant="outline"
                        colorScheme="transparent"
                        aria-label="Comment"
                        borderRadius="6px"
                        border="none"
                        className={styles.iconButton}
                        disabled
                        icon={
                          <SvgIcon
                            iconName="ic_outline-forum"
                            color={colors.gray[600]}
                            size={17}
                          />
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMessageView(true);
                        }}
                      />
                    </Tooltip>
                  )}
                  {processStore?.canUserEditInProcessDetail &&
                    isManageMode &&
                    !isCommonStepFromStepId && (
                      <>
                        <Tooltip
                          label="Edit"
                          height="36px"
                          fontSize="14px"
                          padding={2}
                          background="gray.700"
                          placement="top"
                          color="white"
                          hasArrow
                          borderRadius="4px"
                        >
                          <IconButton
                            variant="outline"
                            colorScheme="transparent"
                            aria-label="Edit"
                            borderRadius="6px"
                            border="none"
                            className={styles.iconButton}
                            icon={
                              <SvgIcon
                                iconName="ic_baseline-edit"
                                color={colors.gray[600]}
                                size={15}
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartEditing(e);
                            }}
                          />
                        </Tooltip>
                        {/* {!step?.commonLibrary &&
                        processStore.process?.isPublished &&
                        !isBasicUser &&
                        commonLibraryStore?.isFeatureEnabled && (
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              className={styles.menuIcon}
                              aria-label="Options"
                              onClick={(e) => e.stopPropagation()}
                              icon={
                                <SvgIcon size={16} iconName="show-more-icon" />
                              }
                            />
                            <MenuList className={styles.menuList}>
                              <MenuItem
                                icon={<SvgIcon size={16} iconName="doc-add" />}
                                onClick={async (event) => {
                                  event.stopPropagation();
                                  try {
                                    await addStepToCommonLibrary({
                                      processId: procedureId,
                                      organizationId:
                                        organizationStore.organization?.id,
                                      stepId: step?.id,
                                    });
                                    getRenderProcess(
                                      processStore.process.id,
                                      processStore
                                    );
                                    toast.success(
                                      "Add step to common library successfully"
                                    );
                                  } catch (error: any) {
                                    toast.error(
                                      `Something wrong happened: ${error}`
                                    );
                                  }
                                }}
                              >
                                Add step to common library
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        )} */}
                      </>
                    )}

                  {processStore?.canUserEditInProcessDetail &&
                    !!isCommonStepFromStepId && (
                      <Tooltip
                        label="Remove"
                        height="36px"
                        fontSize="14px"
                        padding={2}
                        background="gray.700"
                        placement="top"
                        color="white"
                        hasArrow
                        borderRadius="4px"
                      >
                        <IconButton
                          variant="outline"
                          colorScheme="transparent"
                          aria-label="Remove step"
                          borderRadius="6px"
                          border="none"
                          icon={
                            <SvgIcon
                              iconName="ic_delete"
                              color={colors.gray[600]}
                              size={20}
                            />
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCommonStep(e);
                          }}
                        />
                      </Tooltip>
                    )}
                </>
              )}
            </div>
          )}
        </HStack>
        {isMobile && (
          <Box
            onClick={
              isEditing
                ? (event) => {
                    event.stopPropagation();
                    setIsEditStepName(true);
                  }
                : undefined
            }
            flexDirection="row"
            display="flex"
            paddingBottom={2}
          >
            {isEditStepName && isEditing ? (
              <InlineTextField
                value={name}
                onApplyChange={handleEditStepName}
                editFirst
                onStartEdit={() => setIsEditStepName(true)}
                onStopEdit={() => setIsEditStepName(false)}
              />
            ) : (
              <Text
                color="gray.700"
                fontWeight={500}
                lineHeight={5}
                margin={0}
                onClick={isEditing ? () => setIsEditStepName(true) : undefined}
              >
                {`${position}. ${name}`}
              </Text>
            )}
          </Box>
        )}
      </VStack>
      <MediaManager
        onUpdateCaption={handleChangeCaption}
        onFileUpload={uploadMedia}
        className={styles.mediaDialogprops}
        onClose={() => setShowManageMediaDialog(!showManageMediaDialog)}
        isOpen={showManageMediaDialog}
        mediaList={props.mediaList}
        handleShowAutosave={() => handleShowAutosave()}
      />
      <DeleteDialog
        title={step.commonLibrary ? "Delete step?" : "Remove step?"}
        isOpen={!!deleteStepId}
        message="Are you sure you want to REMOVE this step?"
        toggle={() => setDeleteStepId("")}
        onDelete={handleDeleteStepConfirmed}
        onCancel={() => setDeleteStepId("")}
      />
      <ModalAddStep
        isOpen={showModalAddStep}
        onClose={() => setShowModalAddStep(false)}
        procedureId={procedureId}
        handleShowAutosave={() => handleShowAutosave()}
      />
      {/* <SelectIconModal isOpen={isOpen} onClose={onClose} onSelect={onSelect} /> */}
    </Col>
  );
};

export default observer(CardHeader);
