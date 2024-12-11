import {
  Box,
  Checkbox,
  HStack,
  Stack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import cx from "classnames";
import FormInput from "components/Chakra/FormInput";
import MediaThumbnail from "components/MediaThumbnail";
import { MediaType, MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { IMedia } from "interfaces/media";
import { IBlockWithRelations } from "interfaces/block";
import isNumber from "lodash/isNumber";
import Carousel from "nuka-carousel";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getValidArray } from "utils/common";
import { BlockTextFormValues } from "../../../../enums";
import styles from "./mediaLink.module.scss";

interface IMediaLinkProps {
  mediaList: IMedia[];
  mediaLink: IMedia[];
  blockText?: IBlockWithRelations | null;
  setShowMediaLink: (showMediaLink: boolean) => void;
  setMediaLink: (mediaLink: IMedia[]) => void;
  setShowMediaGallery: (showMediaGallery: boolean) => void;
}

const MediaLink = (props: IMediaLinkProps) => {
  const { setShowMediaLink, mediaLink, setMediaLink, setShowMediaGallery } =
    props;
  const { register, reset, setValue } = useFormContext();
  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>();

  function handleRemoveMediaLink(): void {
    setMediaLink([]);
    setValue(`${BlockTextFormValues.MEDIUM_TITLE}`, "");
    setShowMediaLink(false);
  }

  function handleClickSingleMedia(index: number): void {
    if (isNumber(selectedMediaIndex)) {
      setSelectedMediaIndex(undefined);
    } else {
      setSelectedMediaIndex(index);
    }
  }

  useEffect(() => {
    const mediaLabels = getValidArray(mediaLink)?.map((media) => {
      return {
        id: media?.id,
        name:
          media?.name ??
          media?.originalFile ??
          media?.image ??
          media?.video ??
          media?.url,
      };
    });
    reset({ mediaLabels });
  }, [mediaLink]);

  return (
    <Box>
      <VStack spacing={4} width="full" alignItems="unset">
        <Stack direction="row" justifyContent="space-between">
          <Text as="b" color="gray.700" fontSize="md">
            Link media
          </Text>
          <HStack spacing={4}>
            <Text
              as="u"
              color="primary.500"
              fontSize="md"
              cursor="pointer"
              onClick={() => setShowMediaGallery(true)}
            >
              Select media
            </Text>
            <Text
              as="u"
              color="gray.600"
              fontSize="md"
              cursor="pointer"
              onClick={handleRemoveMediaLink}
            >
              Remove
            </Text>
          </HStack>
        </Stack>
        {mediaLink?.length > 0 && (
          <VStack
            width="full"
            alignItems="unset"
            background="gray.50"
            borderRadius={8}
            padding={3}
            spacing={3}
          >
            <Carousel
              className={styles.carousel}
              dragging={true}
              wrapAround={false}
              cellSpacing={8}
              slidesToShow={isTablet ? 4 : 7}
              renderCenterLeftControls={() => null}
              renderCenterRightControls={() => null}
              renderBottomCenterControls={() => null}
            >
              {getValidArray(mediaLink).map((media, index) => {
                media.id = media.id ?? media._id;
                return (
                  <Tooltip
                    key={media?.id}
                    label={
                      media?.name ??
                      media?.originalFile ??
                      media?.image ??
                      media?.video ??
                      media?.url
                    }
                    fontSize="sm"
                    lineHeight="20px"
                    fontWeight="400"
                    padding={2}
                    placement="top-start"
                    maxWidth="220px"
                    background="#5C5C5C"
                    color="white"
                    hasArrow
                    borderRadius="4px"
                  >
                    <div
                      className={cx(styles.elementPlaceholder, {
                        [styles.fileImage]:
                          media?.mediaType === MediaTypeEnum.DOCUMENT,
                        [styles.active]: index === selectedMediaIndex,
                      })}
                      onClick={() => handleClickSingleMedia(index)}
                    >
                      <MediaThumbnail
                        key={media?.id}
                        media={media}
                        width="112px"
                      />
                    </div>
                  </Tooltip>
                );
              })}
            </Carousel>
            {isNumber(selectedMediaIndex) && (
              <FormInput
                autoComplete="off"
                label="Media Label"
                name={`${BlockTextFormValues.MEDIA_LABELS}[${selectedMediaIndex}].name`}
              />
            )}
            <Checkbox
              {...register("isDisableMediaLabel")}
              color="gray.700"
              onChange={(event) =>
                setValue("isDisableMediaLabel", event.target.checked)
              }
            >
              Disable all media label
            </Checkbox>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default MediaLink;
