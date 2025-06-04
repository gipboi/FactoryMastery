import { ArrowBackIcon, ArrowForwardIcon, CloseIcon } from "@chakra-ui/icons";
import { Button, chakra } from "@chakra-ui/react";
import Iframe from "components/Iframe";
import { getOfficeAppLiveUrl } from "components/MediaTab/utils";
import SvgIcon from "components/SvgIcon";
import { S3FileTypeEnum } from "constants/aws";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IMessageAttachment } from "interfaces/message";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
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
  name: string;
  attachments: IMessageAttachment[];
  showModal: boolean;
  onCloseModal: () => void;
}

const LightBox = (props: ILightBoxProps) => {
  const { name, attachments, showModal, onCloseModal } = props;
  const { organizationStore } = useStores();
  const [mediaIndex, setMediaIndex] = useState<number>(-1);
  const [currentAttachment, setCurrentAttachment] =
    useState<IMessageAttachment | null>(null);
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function handleClickPrev(): void {
    setMediaIndex(mediaIndex === 0 ? attachments?.length - 1 : mediaIndex - 1);
  }

  function handleClickNext(): void {
    setMediaIndex(mediaIndex === attachments?.length - 1 ? 0 : mediaIndex + 1);
  }

  useEffect(() => {
    setCurrentAttachment(attachments?.[mediaIndex]);
  }, [mediaIndex]);

  useEffect(() => {
    if (showModal) {
      const currentIndex = attachments.findIndex(
        (attachment) => attachment?.name === name
      );
      setCurrentAttachment(attachments?.[currentIndex]);
      setMediaIndex(currentIndex);
    }
  }, [name]);

  return (
    <ModalContainer showModal={showModal}>
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
          href={
            organizationStore.organization?.id ??
            "" ??
            currentAttachment?.name ??
            ""
          } // Ask Tien
          rel="noreferrer"
          _hover={{ color: "gray.700" }}
          onClick={(event) => event.stopPropagation()}
        >
          Download
        </chakra.a>
      </Button>
      <CloseButton onClick={onCloseModal}>
        <CloseIcon />
      </CloseButton>
      <ModalContent background="transparent">
        {currentAttachment && (
          <Slide
            key={currentAttachment?.name}
            display="flex"
            justifyContent="center"
          >
            {currentAttachment?.type === S3FileTypeEnum.IMAGE && (
              <ImgBox
                alt={currentAttachment?.name}
                src={
                  (S3FileTypeEnum.IMAGE,
                  organizationStore.organization?.id ??
                    "" ??
                    currentAttachment?.name)
                } // Ask Tien
              />
            )}
            {currentAttachment?.type === S3FileTypeEnum.VIDEO && (
              <ReactPlayer
                width={isMobile ? "100%" : "1000px"}
                height={isMobile ? "300px" : "700px"}
                url={
                  (S3FileTypeEnum.VIDEO,
                  organizationStore.organization?.id ??
                    "" ??
                    currentAttachment?.name)
                }
                controls
              />
            )}
            {currentAttachment?.type === S3FileTypeEnum.OTHER && (
              <Iframe
                src={getOfficeAppLiveUrl(
                  S3FileTypeEnum.OTHER ??
                    organizationStore.organization?.id ??
                    "" ??
                    currentAttachment?.name
                )} // Ask Tien
                width={{ base: "100%", md: "1000px" }}
                height={{ base: "300px", md: "700px" }}
              />
            )}
          </Slide>
        )}
      </ModalContent>
      <PrevButton
        onClick={handleClickPrev}
        display={attachments?.length > 1 ? "flex" : "none"}
      >
        <ArrowBackIcon />
      </PrevButton>
      <NextButton
        onClick={handleClickNext}
        display={attachments?.length > 1 ? "flex" : "none"}
      >
        <ArrowForwardIcon />
      </NextButton>
    </ModalContainer>
  );
};
export default observer(LightBox);
