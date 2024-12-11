import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { Button, Center, chakra, HStack, Image } from "@chakra-ui/react";
import Iframe from "components/Iframe";
import {
  convertToEmbedLink,
  getOfficeAppLiveUrl,
} from "components/MediaTab/utils";
import SvgIcon from "components/SvgIcon";
import { MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface IMediaViewProps {
  mediaList: IMedia[];
  mediaIndex: number;
  setSelectedMedia: (media: IMedia) => void;
  isEditingMedia: boolean;
}

const MediaView = (props: IMediaViewProps) => {
  const { mediaList, mediaIndex = 0, setSelectedMedia, isEditingMedia } = props;
  const { organizationStore } = useStores();
  const [currentIndex, setCurrentIndex] = useState<number>(mediaIndex);
  const currentMedia: IMedia = mediaList[currentIndex];
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function handleClickPrev(): void {
    if (currentIndex > 0) {
      setSelectedMedia(mediaList[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  }
  function handleClickNext(): void {
    if (currentIndex < mediaList?.length - 1) {
      setSelectedMedia(mediaList[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  }

  useEffect(() => {
    setCurrentIndex(mediaIndex);
  }, [mediaIndex]);

  return (
    <>
      {currentMedia && (
        <Center
          width="full"
          height="full"
          borderRadius={12}
          border="1px solid #E2E8F0"
          position="relative"
        >
          {!isEditingMedia &&
            currentMedia?.mediaType !== MediaTypeEnum.EMBED && (
              <Button
                gap={2}
                variant="outline"
                color="gray.700"
                background="white"
                fontWeight={500}
                lineHeight={6}
                position="absolute"
                top={2}
                right={2}
                zIndex={2}
              >
                <SvgIcon iconName="download" size={16} />
                <chakra.a
                  color="gray.700"
                  target="_blank"
                  href={currentMedia?.url ?? ""}
                  rel="noreferrer"
                  _hover={{ color: "gray.700" }}
                  onClick={(event) => event.stopPropagation()}
                >
                  Download
                </chakra.a>
              </Button>
            )}
          {currentMedia?.mediaType === MediaTypeEnum.IMAGE && (
            <Image
              width="full"
              height={{ base: "212px", md: "612px" }}
              borderRadius={12}
              objectFit="contain"
              alt={currentMedia.name}
              src={
                currentMedia?.url ??
                currentMedia?.image ??
                currentMedia?.originalImage
              }
            />
          )}
          {currentMedia?.mediaType === MediaTypeEnum.VIDEO && (
            <ReactPlayer
              width="full"
              height={isMobile ? "212px" : "612px"}
              url={currentMedia?.url || currentMedia?.video || ""}
              controls
            />
          )}
          {currentMedia?.mediaType === MediaTypeEnum.DOCUMENT && (
            <Iframe
              width="full"
              height={{ base: "212px", md: "612px" }}
              src={getOfficeAppLiveUrl(currentMedia?.url ?? "")}
            />
          )}
          {currentMedia?.mediaType === MediaTypeEnum.EMBED && (
            <Iframe
              width="full"
              height={{ base: "212px", md: "612px" }}
              src={convertToEmbedLink(currentMedia?.url ?? "")}
            />
          )}
          <HStack
            width="full"
            justify="space-between"
            paddingX={3}
            position="absolute"
            top="50%"
          >
            <Button
              border={0}
              boxSize={10}
              background="gray.100"
              onClick={handleClickNext}
            >
              <ArrowDownIcon boxSize={5} />
            </Button>
            <Button
              border={0}
              boxSize={10}
              background="gray.100"
              onClick={handleClickPrev}
            >
              <ArrowUpIcon boxSize={5} />
            </Button>
          </HStack>
        </Center>
      )}
    </>
  );
};
export default observer(MediaView);
