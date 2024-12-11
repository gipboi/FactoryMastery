import { ArrowBackIcon, ArrowForwardIcon, CloseIcon } from "@chakra-ui/icons";
import { Button, chakra } from "@chakra-ui/react";
import Iframe from "components/Iframe";
import {
  convertToEmbedLink,
  getOfficeAppLiveUrl,
} from "components/MediaTab/utils";
import SvgIcon from "components/SvgIcon";
import { MediaType, MediaTypeEnum } from "constants/media";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IMedia } from "interfaces/media";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { getValidArray } from "utils/common";
import {
  CloseButton,
  ImgBox,
  ModalContainer,
  ModalContent,
  NextButton,
  PrevButton,
  Slide,
} from "./lightBox.styles";

interface ILightBoxProps {
  mediaList: IMedia[];
  showModal: boolean;
  imageIndex: number;
  onCloseModal: () => void;
  defaultImageUrl?: string;
  hasNoBackground?: boolean;
}

const LightBox = ({
  mediaList,
  showModal,
  imageIndex = 0,
  onCloseModal,
}: ILightBoxProps) => {
  const { organizationStore } = useStores();
  const validList: IMedia[] = getValidArray<IMedia>(mediaList);
  const [mediaIndex, setMediaIndex] = useState<number>(imageIndex);
  const currentMedia: IMedia = validList?.[mediaIndex];
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function handleClickPrev(): void {
    setMediaIndex(mediaIndex === 0 ? validList.length - 1 : mediaIndex - 1);
  }
  function handleClickNext(): void {
    setMediaIndex(mediaIndex === validList.length - 1 ? 0 : mediaIndex + 1);
  }

  useEffect(() => {
    setMediaIndex(imageIndex);
  }, [imageIndex]);

  return (
    <ModalContainer showModal={showModal}>
      {currentMedia?.mediaType !== MediaTypeEnum.EMBED && (
        <Button
          gap={2}
          height={12}
          variant="outline"
          color="gray.700"
          background="white"
          fontSize="18px"
          fontWeight={500}
          lineHeight={7}
          position="absolute"
          top={6}
          right={84}
          zIndex={2}
        >
          <SvgIcon iconName="download" size={20} />
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
      <CloseButton onClick={onCloseModal}>
        <CloseIcon />
      </CloseButton>
      <ModalContent background="transparent">
        {currentMedia && (
          <Slide key={currentMedia?.url} display="flex" justifyContent="center">
            {currentMedia?.mediaType === MediaTypeEnum.IMAGE && (
              <ImgBox
                alt={currentMedia?.name}
                src={
                  currentMedia?.url ??
                  currentMedia?.image ??
                  currentMedia?.originalImage ??
                  ""
                }
              />
            )}
            {currentMedia?.mediaType === MediaTypeEnum.VIDEO && (
              <ReactPlayer
                width={isMobile ? "100%" : "1000px"}
                height={isMobile ? "300px" : "700px"}
                url={
                  (organizationStore.organization?.id ?? "",
                  currentMedia?.video || currentMedia?.url || "")
                }
                controls
              />
            )}
            {currentMedia?.mediaType === MediaTypeEnum.DOCUMENT && (
              <Iframe
                src={getOfficeAppLiveUrl(
                  currentMedia?.url ?? currentMedia.document ?? ""
                )}
                width={{ base: "100%", md: "1000px" }}
                height={{ base: "300px", md: "700px" }}
              />
            )}
            {currentMedia?.mediaType === MediaTypeEnum.EMBED && (
              <Iframe
                id={convertToEmbedLink(String(currentMedia?.id) ?? "")}
                src={convertToEmbedLink(currentMedia?.url ?? "")}
                width={{ base: "100%", md: "1000px" }}
                height={{ base: "300px", md: "700px" }}
              />
            )}
          </Slide>
        )}
      </ModalContent>
      <PrevButton
        onClick={handleClickPrev}
        display={validList?.length > 1 ? "flex" : "none"}
      >
        <ArrowBackIcon />
      </PrevButton>
      <NextButton
        onClick={handleClickNext}
        display={validList?.length > 1 ? "flex" : "none"}
      >
        <ArrowForwardIcon />
      </NextButton>
    </ModalContainer>
  );
};
export default observer(LightBox);
