/* eslint-disable max-lines */
import {
  Center,
  Button as CkButton,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import cx from "classnames";
import Button from "components/Button";
import MediaThumbnail from "components/MediaThumbnail";
import SvgIcon from "components/SvgIcon";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { IBlockWithRelations } from "interfaces/block";
import get from "lodash/get";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import colors from "themes/colors.theme";
import { checkValidArray, getValidArray } from "utils/common";
import { BlockTextFormValues } from "../../enums";
import MediaLink from "./components/MediaLink";
import styles from "./decisionPoint.module.scss";
import { primary500 } from "themes/globalStyles";

interface IDecisionPointsProps {
  step: IStepWithRelations;
  showDecisionPointDialog: boolean;
  mediaLink: IMedia[];
  blockText?: IBlockWithRelations | null;
  setMediaLink: (mediaLink: IMedia[]) => void;
  setShowDecisionPointDialog: (showDecisionPointDialog: boolean) => void;
  setDecisionPointIndex: (decisionPointIndex: number) => void;
  setShowLinkInternalStep: (showLinkInternalStep: boolean) => void;
  setShowLinkExternalStep: (showLinkExternalStep: boolean) => void;
  setShowMediaGallery: (showMediaGallery: boolean) => void;
}

const DecisionPoints = (props: IDecisionPointsProps) => {
  const { control, register, setValue } = useFormContext();
  const {
    setShowMediaGallery,
    setShowDecisionPointDialog,
    setDecisionPointIndex,
    setShowLinkInternalStep,
    setShowLinkExternalStep,
    step,
    mediaLink,
    setMediaLink,
    blockText,
  } = props;
  const { fields, append, remove } = useFieldArray({
    control,
    name: BlockTextFormValues.DECISION_POINTS,
  });
  const [showMediaLink, setShowMediaLink] = useState<boolean>(false);
  const [showDecisionPoint, setShowDecisionPoint] = useState<boolean>(false);

  const [isHoveringStepPosition, setIsHoveringStepPosition] =
    useState<number>(-1);

  function checkIsActiveStepButton(
    decisionPoint: Record<"id", string>,
    position: number
  ): boolean {
    const linkedSteps = get(decisionPoint, "linkedSteps");
    return (
      getValidArray(linkedSteps).length > 0 ||
      isHoveringStepPosition === position
    );
  }
  function checkIsActiveMediaButton(
    decisionPoint: Record<"id", string>
  ): boolean {
    const linkedMedia = get(decisionPoint, "linkedMedia");
    return getValidArray(linkedMedia).length > 0;
  }
  function handleOpenDecisionPoint(): void {
    setShowDecisionPoint(true);
    append({});
  }
  function handleRemoveAllDecisionPoints(): void {
    setShowDecisionPoint(false);
    remove();
  }

  useEffect(() => {
    setValue(`${BlockTextFormValues.MEDIUM_TITLE}`, blockText?.mediaTitle);
    if (getValidArray(blockText?.decisionPoints).length > 0) {
      setShowDecisionPoint(true);
    }
    if (blockText?.media) {
      setShowMediaLink(true);
    }
  }, []);

  useEffect(() => {
    setShowMediaLink(!!mediaLink?.length);
  }, [mediaLink]);

  return (
    <div className={styles.container}>
      <div className={styles.decisionPoints}>
        {showDecisionPoint && (
          <div className={styles.infoContainer}>
            <Text as="b" color="gray.700" fontSize="md">
              Decision point(s)
            </Text>
            <Text
              as="u"
              color="gray.600"
              fontSize="md"
              cursor="pointer"
              onClick={handleRemoveAllDecisionPoints}
            >
              Remove all points
            </Text>
          </div>
        )}
        {Array.isArray(fields) &&
          showDecisionPoint &&
          fields.map((decisionPoint, index: number) => {
            const linkedMedia: IMedia[] =
              get(decisionPoint, "linkedMedia") || [];
            return (
              <div
                className={styles.decisionPts}
                key={`decisionPoint-${decisionPoint.id}`}
              >
                <VStack width="full" spacing={3}>
                  <HStack width="full">
                    <div className={styles.inputField}>
                      <Input
                        {...register(
                          `${BlockTextFormValues.DECISION_POINTS}.${index}.content`
                        )}
                        placeholder="Title of the decision point"
                        backgroundColor="white"
                        borderRadius="6px"
                      />
                    </div>
                    <HStack>
                      <Button
                        outline
                        color="info"
                        className={cx([styles.actionButton], {
                          [styles.actionButtonActive]:
                            checkIsActiveMediaButton(decisionPoint),
                        })}
                        onClick={() => {
                          setDecisionPointIndex(index);
                          setShowDecisionPointDialog(true);
                        }}
                      >
                        <span>Media</span>
                      </Button>
                      <Stack>
                        <Menu>
                          <MenuButton
                            background="white"
                            border="none"
                            borderRadius="6px"
                            padding={0}
                            margin={0}
                            onMouseEnter={() =>
                              setIsHoveringStepPosition(index)
                            }
                            onMouseLeave={() => setIsHoveringStepPosition(-1)}
                          >
                            <HStack spacing={0}>
                              <CkButton
                                variant="outline"
                                borderRadius="6px"
                                borderRightRadius={0}
                                fontWeight={500}
                                marginRight={0}
                                fontSize="md"
                                lineHeight={6}
                                border="1px solid"
                                width={20}
                                borderColor="var(--current-primary-color)"
                                background={
                                  checkIsActiveStepButton(decisionPoint, index)
                                    ? "var(--current-primary-color)"
                                    : "white"
                                }
                                color={
                                  checkIsActiveStepButton(decisionPoint, index)
                                    ? "white"
                                    : "var(--current-primary-color)"
                                }
                              >
                                Step
                              </CkButton>
                              <Button
                                outline
                                border={`1px solid ${primary500}`}
                                borderLeft="none !important"
                                borderLeftRadius={0}
                                padding={0}
                                width={10}
                                paddingTop="2px"
                                background={
                                  checkIsActiveStepButton(decisionPoint, index)
                                    ? "var(--current-primary-color)"
                                    : "transparent"
                                }
                              >
                                {checkIsActiveStepButton(
                                  decisionPoint,
                                  index
                                ) && (
                                  <SvgIcon
                                    iconName="arrow-down-s-line"
                                    color="white"
                                    size={20}
                                  />
                                )}
                                {!checkIsActiveStepButton(
                                  decisionPoint,
                                  index
                                ) && (
                                  <SvgIcon
                                    iconName="arrow-down-s-line"
                                    color={document?.documentElement?.style?.getPropertyValue(
                                      "--current-primary-color"
                                    )}
                                    size={20}
                                  />
                                )}
                              </Button>
                            </HStack>
                          </MenuButton>
                          <MenuList minWidth="auto">
                            <MenuItem
                              background="white"
                              border="none"
                              color="gray.700"
                              onClick={() => {
                                setDecisionPointIndex(index);
                                setShowLinkInternalStep(true);
                              }}
                            >
                              Internal step
                            </MenuItem>
                            <MenuItem
                              background="white"
                              border="none"
                              color="gray.700"
                              onClick={() => {
                                setDecisionPointIndex(index);
                                setShowLinkExternalStep(true);
                              }}
                            >
                              External step
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Stack>
                    </HStack>
                    <div
                      className={styles.removeButton}
                      onClick={() => remove(index)}
                    >
                      <SvgIcon iconName="ic_close" color={colors.gray[600]} />
                    </div>
                  </HStack>
                  {checkValidArray(linkedMedia) && (
                    <HStack
                      width="full"
                      wrap="wrap"
                      padding={3}
                      gap={2}
                      spacing={0}
                    >
                      {getValidArray(linkedMedia).map((media: IMedia) => (
                        <Center key={`media-${media?.id}`} position="relative">
                          <MediaThumbnail
                            media={media}
                            width="96px"
                            height="86px"
                            borderRadius={4}
                            border="1px solid #CBD5E0"
                          />
                        </Center>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </div>
            );
          })}
        {showDecisionPoint && (
          <Text
            cursor="pointer"
            paddingTop={4}
            color="gray.600"
            fontSize="sm"
            width="fit-content"
            onClick={handleOpenDecisionPoint}
          >
            + Add decision point
          </Text>
        )}
        {showMediaLink && (
          <MediaLink
            mediaList={getValidArray(step?.media)}
            setShowMediaLink={setShowMediaLink}
            mediaLink={mediaLink}
            setMediaLink={setMediaLink}
            blockText={blockText}
            setShowMediaGallery={setShowMediaGallery}
          />
        )}
      </div>
      {!(showDecisionPoint || showMediaLink) && (
        <HStack className={styles.actionContainer}>
          <Button
            outline
            color="white"
            className={cx(
              styles.btnActionWithIcon,
              styles.smallSpacingTop,
              styles.smallSpacingBottom
            )}
            onClick={() => {
              setShowMediaLink(true);
              setShowMediaGallery(true);
            }}
          >
            <SvgIcon size={16} iconName="media-blue" />
            Media
          </Button>
          <Button
            outline
            color="white"
            className={cx(
              styles.btnActionWithIcon,
              styles.smallSpacingTop,
              styles.smallSpacingBottom
            )}
            onClick={handleOpenDecisionPoint}
          >
            <SvgIcon size={16} iconName="decision-point" />
            Add decision point
          </Button>
        </HStack>
      )}
    </div>
  );
};

export default DecisionPoints;
