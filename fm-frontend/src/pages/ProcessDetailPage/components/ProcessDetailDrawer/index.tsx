import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { observer } from "mobx-react";
import { useParams } from "react-router";
// import ItemProcess from 'components/Pages/SearchPage/components/ItemProcess'
import SvgIcon from "components/SvgIcon";
import ViewBox from "components/ViewBox";
import { AuthRoleNameEnum } from "constants/user";
// import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder'
import { getRenderProcess } from "pages/ProcessDetailPage/utils/process";
import routes from "routes";
import { getValidArray } from "utils/common";
// import { getName } from "utils/users";
import ItemProcess from "components/ItemProcess";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useEffect } from "react";
import { getName } from "utils/user";
import ShareProcessToCollectionModal from "../ShareProcessToCollectionModal";
import ShareProcessToGroupModal from "../ShareProcessToGroupModal";
import ShareProcessToUserModal from "../ShareUserModal";

interface IProcessDetailDrawerProps {
  isOpen: boolean;
  onOpenEditDrawer: () => void;
  onClose: () => void;
  canSetting: boolean;
}

const ProcessDetailDrawer = (props: IProcessDetailDrawerProps) => {
  const { isOpen, onClose, onOpenEditDrawer, canSetting } = props;
  const params = useParams();
  const processId = String(get(params, "processId", ""));

  const { authStore, processStore, organizationStore } = useStores();
  const { processDetail } = processStore;
  const { organization } = organizationStore;
  const organizationId: string = organization?.id ?? "";
  const isBasicUser =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;

  const collections = getValidArray(processDetail?.collections);
  const groups = getValidArray(processDetail?.groups);
  const usersProcess = getValidArray(processDetail?.userProcesses).map(
    (userProcess) => userProcess.user
  );
  const users = uniqBy(usersProcess, "id");

  const {
    isOpen: isOpenShareCollectionModal,
    onOpen: onOpenShareCollectionModal,
    onClose: onCloseShareCollectionModal,
  } = useDisclosure();
  const {
    isOpen: isOpenShareGroupModal,
    onOpen: onOpenShareGroupModal,
    onClose: onCloseShareGroupModal,
  } = useDisclosure();
  const {
    isOpen: isOpenShareUserModal,
    onOpen: onOpenShareUserModal,
    onClose: onCloseShareUserModal,
  } = useDisclosure();

  useEffect(() => {
    if (isOpen) {
      processStore.getProcessDetailById(processId);
    }
  }, [isOpen]);

  return (
    <Drawer isOpen={isOpen} size="lg" placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton
          background="white"
          border="none"
          variant="outline"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <DrawerHeader
          borderBottom="1px solid"
          borderColor="gray.200"
          borderBottomWidth="1px"
          color="gray.800"
          fontSize="lg"
        >
          Process detail
        </DrawerHeader>

        <DrawerBody paddingY={4}>
          <VStack align="flex-start">
            <ItemProcess label="Created by">
              <HStack align="flex-start" width="100%">
                <Avatar
                  size="xs"
                  name={getName(processDetail?.creatorName)}
                  src={processDetail?.creatorImage ?? ""}
                />
                <Text color="gray.700" fontSize="md" fontWeight="400">
                  {processDetail?.creatorName?.trim() ?? ""}
                </Text>
              </HStack>
            </ItemProcess>

            {processDetail?.version && (
              <ItemProcess label="Version number">
                <Tag
                  variant="solid"
                  background="gray.200"
                  width="48px"
                  height="24px"
                  borderRadius="6px"
                  fontSize="md"
                  color="gray.700"
                >
                  {processDetail.version}
                </Tag>
              </ItemProcess>
            )}

            <ItemProcess label="Last updated">
              <Text
                width="100%"
                color="gray.700"
                fontSize="md"
                fontWeight="400"
              >
                {dayjs(processDetail?.updatedAt).format("MMMM DD, YYYY")}
              </Text>
            </ItemProcess>

            <HStack
              width="100%"
              spacing={0}
              transition="200ms all"
              _hover={{ backgroundColor: "gray.50", transition: "200ms all" }}
            >
              <ItemProcess label="Release notes">
                <Text
                  width="100%"
                  color="gray.700"
                  fontSize="md"
                  fontWeight="400"
                >
                  {processDetail?.releaseNote ?? ""}
                </Text>
              </ItemProcess>
            </HStack>

            {!isBasicUser && (
              <ItemProcess label="Editor notes">
                <Text
                  width="100%"
                  color="gray.700"
                  fontSize="md"
                  fontWeight="400"
                >
                  {processDetail?.editorNote ?? ""}
                </Text>
              </ItemProcess>
            )}

            <ItemProcess label="Document type">
              <HStack
                width="full"
                spacing={2}
                transition="200ms all"
                _hover={{ backgroundColor: "gray.50", transition: "200ms all" }}
              >
                {processDetail?.documentType?.iconBuilder && (
                  <IconBuilder
                    icon={processDetail?.documentType?.iconBuilder}
                    size={24}
                    isActive
                  />
                )}

                <Text
                  width="100%"
                  color="gray.700"
                  fontSize="md"
                  fontWeight="400"
                >
                  {processDetail?.documentType?.name ?? ""}
                </Text>
              </HStack>
            </ItemProcess>

            <ItemProcess label="Tags">
              <HStack spacing={0} gap={2} flexWrap="wrap">
                {getValidArray(processDetail.tags)?.map((tag, index) => (
                  <Tag
                    key={`${processDetail?.id ?? 0} ${tag.id} ${index}`}
                    variant="solid"
                    background="gray.200"
                    h="24px"
                    borderRadius="6px"
                    fontSize="14px"
                    color="gray.700"
                    whiteSpace="nowrap"
                  >
                    {tag.name}
                  </Tag>
                ))}
              </HStack>
            </ItemProcess>

            <ItemProcess
              label={`Collections ${
                collections.length === 0 ? "" : `(${collections.length})`
              }`}
            >
              <ViewBox
                link={routes.collections.value}
                onClick={isBasicUser ? undefined : onOpenShareCollectionModal}
                items={getValidArray(collections).map((collection) => ({
                  id: collection.id ?? "",
                  name: collection.name ?? "",
                  imageUrl: collection?.mainMedia ?? "",
                }))}
              />
            </ItemProcess>

            <ItemProcess
              label={`Groups ${
                groups.length === 0 ? "" : `(${groups.length})`
              }`}
            >
              <ViewBox
                link={routes.groups.value}
                onClick={!canSetting ? undefined : onOpenShareGroupModal}
                items={getValidArray(groups).map((group) => ({
                  id: group?.id ?? "",
                  name: group?.name ?? "",
                  imageUrl: "",
                }))}
              />
            </ItemProcess>

            <ItemProcess
              label={`Users ${users.length === 0 ? "" : `(${users.length})`}`}
            >
              <ViewBox
                link={routes.users.value}
                onClick={isBasicUser ? undefined : onOpenShareUserModal}
                items={getValidArray(users).map((user) => ({
                  name: getName(user),
                  id: user?.id ?? "",
                  imageUrl: user?.image ?? "",
                }))}
              />
            </ItemProcess>

            {/* *TODO: Update when implement collection */}
            {/* <ItemProcess
              label={
                `Collections `
                // collections.length === 0 ? "" : `(${collections.length})`
              }
            >
              <ViewBox
                link={routes.collections.value}
                onClick={isBasicUser ? undefined : onOpenShareCollectionModal}
                // items={getValidArray(collections).map((collection) => ({
                //   id: collection.id ?? 0,
                //   name: collection.name ?? "",
                //   imageUrl: collection?.mainMedia
                //     ? getS3FileUrl(
                //         S3FileTypeEnum.IMAGE,
                //         organizationId,
                //         collection?.mainMedia
                //       )
                //     : missingImage,
                // }))}
                items={[]}
              />
            </ItemProcess> */}
          </VStack>
        </DrawerBody>

        {canSetting && (
          <DrawerFooter
            borderTop="1px solid"
            borderColor="gray.200"
            borderTopWidth="2px"
          >
            <Button
              fontFamily="Roboto"
              variant="outline"
              borderRadius="6px"
              color="gray.700"
              fontWeight={500}
              fontSize="md"
              lineHeight="24px"
              background="white"
              border="1px solid"
              borderColor="gray.200"
              leftIcon={<SvgIcon iconName="setting" size={16} />}
              onClick={onOpenEditDrawer}
            >
              Settings
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>

      {isOpenShareCollectionModal && (
        <ShareProcessToCollectionModal
          isOpen={isOpenShareCollectionModal}
          onClose={onCloseShareCollectionModal}
          afterShare={async () => getRenderProcess(processId, processStore)}
        />
      )}

      {isOpenShareGroupModal && (
        <ShareProcessToGroupModal
          isOpen={isOpenShareGroupModal}
          onClose={onCloseShareGroupModal}
          afterShare={async () => getRenderProcess(processId, processStore)}
        />
      )}

      {isOpenShareUserModal && (
        <ShareProcessToUserModal
          isOpen={isOpenShareUserModal}
          onClose={onCloseShareUserModal}
          afterShare={async () => getRenderProcess(processId, processStore)}
        />
      )}
    </Drawer>
  );
};

export default observer(ProcessDetailDrawer);
