import { Center, HStack, Link, Stack, Text, VStack } from '@chakra-ui/react';
import cx from 'classnames';
import LightBox from 'components/LightBox';
import MediaThumbnail from 'components/MediaThumbnail';
import SvgIcon from 'components/SvgIcon';
import { EMediaDefaultName } from 'constants/media';
import parse from 'html-react-parser';
import { IBlockWithRelations } from 'interfaces/block';
import {
  IDecisionPointMediaWithRelations,
  IDecisionPointStepWithRelations,
  IDecisionPointWithRelations,
} from 'interfaces/decisionPoint';
import { IMedia } from 'interfaces/media';
import { IStepWithRelations } from 'interfaces/step';
import { observer } from 'mobx-react';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import { useState } from 'react';
import { Col, Row, RowProps } from 'reactstrap';
import routes from 'routes';
import colors from 'themes/colors.theme';
import { primary500 } from 'themes/globalStyles';
import { getValidArray } from 'utils/common';
import styles from './taskCard.module.scss';
import { useStores } from 'hooks/useStores';
import { EIconType } from 'interfaces/iconBuilder';

interface ITaskCardProps extends RowProps {
  task: IBlockWithRelations;
  isEditing: boolean;
  mediaList: IMedia[];
  selectedMedia: IMedia;
  setSelectedMedia: (media: IMedia) => void;
}

const TaskCard = (props: ITaskCardProps) => {
  const { iconBuilderStore } = useStores()
  const { task, isEditing, mediaList, selectedMedia, setSelectedMedia } = props;
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const decisionPoints = task?.decisionPoints || [];
  const taskMedias = getValidArray(task?.blockMedias).map(
    (blockMedia) => (blockMedia?.media as IMedia[])?.[0] ?? blockMedia?.media
  );

  function handleOpenLightBox(
    event: { stopPropagation: () => void },
    media?: IMedia
  ): void {
    if (!isEditing && media) {
      event.stopPropagation();
      setSelectedMedia(media);
      setShowLightBox(true);
    }
  }

  return (
    <Row className={styles.container}>
      <Col className={styles.layout} md="12">
        <IconBuilder icon={task?.icon ?? iconBuilderStore.defaultIcons?.find((icon) => icon.type === EIconType.BLOCK)} size={40} isActive />
        <div className={styles.taskInformation}>
          <div
            className={cx(
              styles.description
              /*
                TODO: integrate later
                { [styles.completedDescription]: task?.completed }
                */
            )}
          >
            {parse(task?.content)}
          </div>
          <Stack
            width="full"
            wrap="wrap"
            flexDirection={task?.isDisableMediaLabel ? 'row' : 'column'}
            gap={3}
            spacing={0}
          >
            {getValidArray(decisionPoints)?.length === 0 &&
              getValidArray(taskMedias).map((media: IMedia) => (
                <VStack
                  align="flex-start"
                  onClick={(event) => {
                    event?.stopPropagation();
                    setSelectedMedia(media as IMedia);
                  }}
                  cursor="pointer"
                >
                  {media && !task?.isDisableMediaLabel && (
                    <HStack>
                      <SvgIcon iconName="media-blue" size={20} />
                      <Text
                        color={colors.primary[500]}
                        fontSize="sm"
                        lineHeight={5}
                        fontWeight={500}
                      >
                        {media?.name ||
                          media?.originalImage ||
                          media?.originalFile ||
                          media?.image ||
                          EMediaDefaultName.NO_NAME}
                      </Text>
                    </HStack>
                  )}
                  {media && (
                    <Center position="relative">
                      <MediaThumbnail
                        media={media}
                        width="156px"
                        height="126px"
                        borderRadius={4}
                        border="1px solid #CBD5E0"
                        onClick={(event) => handleOpenLightBox(event, media)}
                      />
                    </Center>
                  )}
                </VStack>
              ))}
          </Stack>
          {Array.isArray(decisionPoints) &&
            decisionPoints?.map(
              (decisionPoint: IDecisionPointWithRelations, index: number) => {
                return (
                  <div
                    className={styles.decisionPointCard}
                    key={`taskCard-decisionPoint-${
                      decisionPoint?.id ?? decisionPoint?._id
                    }${index}`}
                  >
                    <div className={styles.title}>{decisionPoint?.title}</div>
                    <VStack
                      align="flex-start"
                      paddingLeft={2}
                      borderLeft="4px solid #00A9EB"
                      spacing={4}
                    >
                      {Array.isArray(decisionPoint?.decisionPointSteps) &&
                        decisionPoint?.decisionPointSteps.map(
                          (
                            decisionPointStep: IDecisionPointStepWithRelations,
                            index: number
                          ) => {
                            const stepDetail =
                              (
                                decisionPointStep?.step as IStepWithRelations[]
                              )?.[0] ?? decisionPointStep?.step;
                            return (
                              <HStack>
                                <SvgIcon iconName="glyphs" size={24} />
                                <Link
                                  key={`decisionPointStep-${decisionPointStep?.stepId}${index}`}
                                  href={`${routes.processes.processId.value(
                                    String(stepDetail?.processId ?? 0)
                                  )}?selectedStepId=${
                                    decisionPointStep?.stepId
                                  }`}
                                  fontSize="14px"
                                  color={primary500}
                                  textDecor="underline"
                                >
                                  {stepDetail?.name}
                                </Link>
                              </HStack>
                            );
                          }
                        )}
                      {Array.isArray(decisionPoint?.decisionPointMedias) &&
                        decisionPoint?.decisionPointMedias?.map(
                          (
                            decisionPointMedia: IDecisionPointMediaWithRelations
                          ) => {
                            const mediaDetail =
                              (decisionPointMedia?.media as IMedia[])?.[0] ??
                              decisionPointMedia?.media;
                            return (
                              <VStack
                                key={decisionPointMedia?.mediaId}
                                align="flex-start"
                                spacing={1}
                              >
                                <Center position="relative">
                                  <MediaThumbnail
                                    media={mediaDetail}
                                    width="156px"
                                    height="126px"
                                    borderRadius={4}
                                    border="1px solid #CBD5E0"
                                    onClick={(event) =>
                                      handleOpenLightBox(event, mediaDetail)
                                    }
                                  />
                                </Center>
                                <Text
                                  width="156px"
                                  color="gray.500"
                                  fontSize="12px"
                                  fontWeight={500}
                                  lineHeight={4}
                                >
                                  {mediaDetail?.originalFile}
                                </Text>
                              </VStack>
                            );
                          }
                        )}
                    </VStack>
                  </div>
                );
              }
            )}
        </div>
      </Col>
      <LightBox
        mediaList={mediaList}
        showModal={showLightBox}
        imageIndex={getValidArray(mediaList).findIndex(
          (media) => media?.id === selectedMedia?.id
        )}
        onCloseModal={() => setShowLightBox(false)}
      />
    </Row>
  );
};

export default observer(TaskCard);
