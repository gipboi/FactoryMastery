import { AddIcon } from "@chakra-ui/icons";
import {
  Button as CkButton,
  Flex,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import cx from "classnames";
import Button from "components/Button";
import Icon from "components/Icon";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import { observer } from "mobx-react";
import { ViewMode } from "pages/CollectionsPage/constants";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { ReactComponent as SortIcon } from "../../../../assets/icons/sort.svg";
import { ITheme } from "../../../../interfaces/theme";
import styles from "./header.module.scss";

interface IHeaderProps {
  viewMode: ViewMode;
  changeViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  showFilterDialog: React.MouseEventHandler<HTMLButtonElement>;
  showCreateCollectionDialog: React.MouseEventHandler<HTMLButtonElement>;
}

const Header = ({
  viewMode,
  changeViewMode,
  showFilterDialog,
  showCreateCollectionDialog,
}: IHeaderProps) => {
  const { authStore, collectionStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { isManageMode } = collectionStore;
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const isDesktop: boolean =
    useBreakpointValue({ base: false, lg: true }) || false;

  useEffect(() => {
    if (get(location, "state.showCreateCollectionDialog", false)) {
      showCreateCollectionDialog({} as any);
      navigate(location, { ...location, state: {}, replace: true });
    }
  });

  function countAllFilterCollections(): number {
    const keys = [
      "groups",
      "process",
      "documentTypeIds",
      "processTags",
      "modifiedDate",
      "sortBy",
    ];
    let count = 0;

    keys.forEach((key) => {
      const value = params.get(key);
      if (value && value.trim() !== "") {
        count++;
      }
    });

    return count;
  }
  return (
    <Row className={styles.container}>
      <Col md="12" className={styles.layout}>
        <div className={styles.viewModeGroup}>
          <Button
            outline
            className={
              +viewMode === ViewMode.List
                ? styles.active
                : styles.buttonViewMode
            }
            onClick={() => changeViewMode(ViewMode.List)}
          >
            <Icon group="unicon" icon="list-ul" />
          </Button>
          <Button
            outline
            className={
              +viewMode === ViewMode.Grid
                ? styles.active
                : styles.buttonViewMode
            }
            onClick={() => changeViewMode(ViewMode.Grid)}
          >
            <Icon group="unicon" icon="apps" />
          </Button>
        </div>
        <div className="d-flex align-items-center justify-content-start">
          <div
            className={cx(styles.actionBtns, styles.filterIcon, {
              [styles.active]: countAllFilterCollections() > 0,
            })}
          >
            <CkButton
              style={{ marginLeft: 16 }}
              backgroundColor="white"
              gap={{ base: 0, md: 2 }}
              border="1px solid #E2E8F0"
              borderRadius="6px"
              cursor="pointer"
              padding={{ base: "10px", md: "16px" }}
              variant="solid"
              className={styles.button}
              onClick={showFilterDialog}
            >
              <SortIcon className={styles.icon} />
              <Text
                marginBottom="0"
                fontWeight={500}
                fontSize={{
                  base: "0px",
                  md: "16px",
                }}
                lineHeight="24px"
                color="gray.700"
              >
                {`Filter ${
                  countAllFilterCollections() > 0
                    ? `(${countAllFilterCollections()})`
                    : ""
                }`}
              </Text>
            </CkButton>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end align-self-end flex-grow-1">
          {!isBasicUser && isManageMode && (
            <CkButton
              type="submit"
              border={0}
              color="white"
              fontSize="16px"
              fontWeight={500}
              lineHeight={6}
              borderRadius={8}
              onClick={showCreateCollectionDialog}
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
            >
              {isDesktop ? (
                <Flex height={6} alignItems="center">
                  <AddIcon fontSize="12px" marginRight="8px" />
                  Create Collection
                </Flex>
              ) : (
                <AddIcon fontSize="12px" />
              )}
            </CkButton>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default observer(Header);
