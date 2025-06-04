import {
  Avatar,
  Checkbox,
  HStack,
  IconButton,
  Stack,
  Tooltip,
  chakra,
} from '@chakra-ui/react';
import cx from 'classnames';
import Icon, { blockIcon } from 'components/Icon';
import SvgIcon from 'components/SvgIcon';
import { EBreakPoint } from 'constants/theme';
import useBreakPoint from 'hooks/useBreakPoint';
import { IProcessWithRelations } from 'interfaces/process';
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { ReactComponent as IconDetail } from 'assets/icons/ic_detail.svg';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import routes from 'routes';
import styles from './styles.module.scss';

interface IProcessCardProps {
  procedure: IProcessWithRelations;
  onClick?: () => void;
  isActive?: boolean;
  isDraft?: boolean;
  isShare?: boolean;
  isChecked?: boolean;
  handleChangeProcessList: (
    id: string,
    type: string,
    isToggle: boolean,
    process?: IProcessWithRelations
  ) => void;
  activeTab: string;
  isManageMode?: boolean;
  canEditProcess?: boolean;
}

const ProcessCard = (props: IProcessCardProps) => {
  const {
    procedure,
    onClick,
    isActive,
    isManageMode,
    canEditProcess = true,
  } = props;
  // const { iconBuilderStore } = useStores();
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  return (
    <Fragment>
      <Row
        className={cx(styles.container, { [styles.active]: isActive })}
        data-bs-toggle="modal"
      >
        <Col md="12" sm="12" xs="12" className={styles.layout}>
          {isManageMode ? (
            <Stack width={4} height={4} marginRight={4}>
              <Checkbox
                disabled={!canEditProcess}
                isChecked={props.isChecked}
                onChange={() =>
                  props.handleChangeProcessList(
                    procedure?.id,
                    props.activeTab,
                    true,
                    procedure
                  )
                }
              ></Checkbox>
            </Stack>
          ) : null}
          <div className={styles.buttonWrapper}>
            <IconBuilder
              key={`icon-preview-${blockIcon?.id}`}
              icon={procedure?.documentType?.iconBuilder ?? blockIcon}
              size={40}
              isActive={true}
            />
            <chakra.div
              className={styles.processName}
              maxWidth="700px"
              minWidth="200px"
              marginLeft={4}
              onClick={() =>
                navigate(
                  routes.processes.processId.value(String(procedure?.id))
                )
              }
            >
              {procedure.name}
            </chakra.div>
            {!isMobile && (
              <HStack flex={1}>
                <Avatar
                  size="sm"
                  name={procedure?.creatorName}
                  src={procedure?.creatorImage ?? ''}
                />
                <chakra.div
                  className={styles.processName}
                  textOverflow="ellipsis"
                  maxWidth="200px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  color="#2d3748"
                >
                  {procedure.creatorName}
                </chakra.div>
              </HStack>
            )}
            <HStack width="full" maxWidth="40px" flex={1}>
              <Tooltip
                label="Quick view"
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
                  variant="ghost"
                  colorScheme="#F7FAFC"
                  aria-label="Call Segun"
                  className={styles.iconButton}
                  icon={<IconDetail className={styles.iconDetail} />}
                  onClick={onClick}
                />
              </Tooltip>
              {props?.isShare ? <Icon icon="lock-alt" group="unicon" /> : null}
              {props?.isShare ? (
                <SvgIcon iconName="share-process" size={40} />
              ) : null}
            </HStack>
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

export default ProcessCard;
