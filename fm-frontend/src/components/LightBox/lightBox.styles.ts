import {
  chakra,
  Box as CkBox,
  Button as CkButton,
  Img as CkImg,
} from "@chakra-ui/react";
import colors from "themes/colors.theme";
import { BaseStyle } from "types/common";
import chakraShouldForwardProp from "utils/chakraShouldForwardProp";

export const ModalContainer = chakraShouldForwardProp(
  CkBox,
  (props: BaseStyle) => ({
    display: props?.showModal ? "block" : "none",
    position: "fixed",
    zIndex: 99999,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "blackAlpha.800",
  })
);

export const ModalContent = chakra(CkBox, {
  baseStyle: () => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    width: "90%",
    maxWidth: 1200,
    borderRadius: 4,
  }),
});

export const CloseButton = chakra(CkButton, {
  baseStyle: () => ({
    color: "gray.700",
    position: "absolute",
    width: "48px",
    height: "48px",
    top: "24px",
    right: "24px",
    fontWeight: 100,
    backgroundColor: "white",
    zIndex: 99999,
    border: "none",
  }),
});

export const PrevButton = chakra(CkButton, {
  baseStyle: () => ({
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    transform: "translate(0,-50%)",
    left: 10,
    width: 10,
    height: 10,
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
    fontWeight: "bold",
    fontSize: "xl",
    border: "none",
    userSelect: "none",
  }),
});

export const NextButton = chakra(CkButton, {
  baseStyle: () => ({
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    transform: "translate(0,-50%)",
    right: 10,
    width: 10,
    height: 10,
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
    fontWeight: "bold",
    fontSize: "xl",
    border: "none",
    userSelect: "none",
  }),
});

export const Slide = chakraShouldForwardProp(CkBox, (props: BaseStyle) => ({
  display: props.display ? "none" : "block",
}));

export const ImgBox = chakra(CkImg, {
  baseStyle: () => ({
    width: "100%",
    height: "100%",
    maxHeight: "90vh",
    objectFit: "contain",
  }),
});

export const IndexBox = chakra(CkBox, {
  baseStyle: () => ({
    position: "absolute",
    width: 40,
    height: 10,
    backgroundColor: "black",
    borderRadius: 25,
    textAlign: "center",
    lineHeight: 10,
    color: "white",
    bottom: "3%",
    left: "50%",
    transform: "translate(-50%, 0)",
  }),
});
