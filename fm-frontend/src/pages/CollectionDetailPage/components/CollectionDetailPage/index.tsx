/* eslint-disable max-lines */
import {
  Box,
  Button,
  HStack,
  Image,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import ProcedureIcon from "components/Common/ProcedureIcon";
import SvgIcon from "components/SvgIcon";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { ICollection } from "interfaces/collection";
import { ITheme } from "interfaces/theme";
import get from "lodash/get";
import { observer } from "mobx-react";
import FilterProcessModal from "pages/CollectionDetailPageEdit/components/FilterProcess";
import { ECollectionFilterName } from "pages/CollectionsPage/components/FilterModal/contants";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLocation } from "react-router-dom";
import routes from "routes";
import { primary700 } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import { filterProcesses, getFilterItemIds } from "./utils";

interface CollectionDetailPageProps {
  collectionDetail: ICollection;
}

const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({
  collectionDetail,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const {
    collectionStore,
    organizationStore,
    authStore,
    userStore,
    documentTypeStore,
    tagStore,
  } = useStores();
  const { collection } = collectionStore;
  const collectionId: number = Number(get(params, "collectionId", ""));
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};
  const organizationId: string = authStore.userDetail?.organizationId ?? "";
  const [isOpenFilterProcess, setIsOpenFilterProcess] =
    useState<boolean>(false);
  const [filteredProcesses, setFilteredProcesses] = useState(
    collection?.collectionsProcesses ?? []
  );

  const imageUrl = collection?.mainMedia
    ? (collection?.organizationId ?? "", collection.mainMedia)
    : "";

  useEffect(() => {
    if (collectionId) {
      userStore.getUsers({
        where: { organizationId }, //, isInactive: false
        order: ["firstName ASC"],
      });
      documentTypeStore.fetchDocumentTypes({
        where: { organizationId },
        order: ["name ASC"],
      });
      tagStore.fetchTags({ where: { organizationId } });
    }
  }, [collectionId, collection?.isVisible]);

  useEffect(() => {
    const userIds: string[] = getFilterItemIds(
      search,
      ECollectionFilterName.USERS
    );
    const documentTypeIds: string[] = getFilterItemIds(
      search,
      ECollectionFilterName.PROCESS_DOCUMENT_TYPES
    );
    const tagIds: string[] = getFilterItemIds(
      search,
      ECollectionFilterName.PROCESS_TAGS
    );
    const processes = filterProcesses(
      collection?.collectionsProcesses ?? [],
      userIds,
      documentTypeIds,
      tagIds
    );
    setFilteredProcesses(processes);
  }, [collection, search.toString()]);

  return (
    <VStack marginTop="16px" width="full" height="full" spacing="6">
      {/* // TODO: Note and comment feature, Integrate later
       {userCanEdit && (
        <HStack justifyContent="flex-end" width="full">
          <Button
            gap={2}
            variant="outline"
            color="gray.700"
            background="white"
            fontWeight={500}
            lineHeight={6}
            // onClick={() => setIsOpenLeaveNoteModal(true)}
          >
            <SvgIcon iconName="ic_outline-forum" size={16} />
            Note
          </Button>
          <Button
            gap={2}
            variant="outline"
            color="gray.700"
            background="white"
            fontWeight={500}
            lineHeight={6}
            // onClick={() => setIsOpenLeaveCommentModal(true)}
          >
            <SvgIcon iconName="outline-message" size={16} />
            Comment
          </Button>
        </HStack>
      )} */}
      <Stack
        width="full"
        align="flex-start"
        flexDirection={{ base: "column", md: "row" }}
        gap={6}
        spacing={0}
      >
        <VStack width="full" background=" white" borderRadius={8} padding={4}>
          <VStack width="full" alignItems="flex-start" spacing={6}>
            <HStack
              spacing={4}
              minWidth="max-content"
              justifyContent="space-between"
              width="100%"
            >
              <HStack spacing={2} alignItems="center" alignSelf="flex-start">
                <Text
                  fontSize="18px"
                  color="gray.800"
                  fontWeight="600"
                  lineHeight="28px"
                  marginBottom={0}
                >
                  Detail
                </Text>
              </HStack>
              <Box>
                <HStack>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="600"
                    lineHeight="20px"
                  >
                    Last Updated
                  </Text>
                  <Text
                    margin={0}
                    fontSize="14px"
                    color="gray.500"
                    fontWeight="400"
                    lineHeight="20px"
                  >
                    {dayjs(collection?.updatedAt).format("MMM D, YYYY")}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <VStack width="full" alignItems="flex-start" spacing={4}>
              <HStack alignItems="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  minWidth={{ base: "100px", md: "168px" }}
                  marginBottom={0}
                >
                  Groups
                </Text>
                <HStack spacing={0} gap={2} display="flex" flexWrap="wrap">
                  {collection?.collectionGroups?.map((collectionGroup) => {
                    const groupMember = collectionGroup?.group;
                    return (
                      <Tag
                        key={groupMember?.id}
                        variant="outline"
                        background="gray.50"
                        boxShadow="inset 0 0 0px 1px #CBD5E0"
                        borderRadius="6px"
                        fontSize="14px"
                        color="gray.700"
                        height="24px"
                        padding="8px"
                        whiteSpace="nowrap"
                        justifyContent="center"
                        alignItems="center"
                      >
                        {groupMember?.name}
                      </Tag>
                    );
                  })}
                </HStack>
              </HStack>
              <HStack width="full" align="flex-start">
                <Text
                  fontSize="14px"
                  color="gray.700"
                  fontWeight="600"
                  lineHeight="20px"
                  minWidth={{ base: "100px", md: "168px" }}
                  marginBottom={0}
                >
                  Description
                </Text>
                <Text
                  color="gray.700"
                  fontSize="16px"
                  fontWeight="400"
                  lineHeight="24px"
                  dangerouslySetInnerHTML={{
                    __html: collection?.overview?.trim() ?? "",
                  }}
                />
              </HStack>
              <VStack width="full" align="flex-start" spacing={3}>
                <HStack width="full" justify="space-between">
                  <Text
                    fontSize="14px"
                    color="gray.700"
                    fontWeight="600"
                    lineHeight="20px"
                    minWidth={{ base: "100px", md: "168px" }}
                    marginBottom={0}
                  >
                    Processes
                  </Text>
                  <Button
                    variant="outline"
                    background="white"
                    gap={{ base: 0, md: 2 }}
                    paddingX={{ base: "10px", md: "16px" }}
                    onClick={() => setIsOpenFilterProcess(true)}
                  >
                    <SvgIcon size={16} iconName="sort" />
                    <Text
                      margin={0}
                      color="gray.700"
                      fontSize={{
                        base: "0px",
                        md: "16px",
                      }}
                      fontWeight={500}
                      lineHeight={6}
                    >
                      Filter
                    </Text>
                  </Button>
                </HStack>
                <VStack
                  width="full"
                  align="flex-start"
                  background="gray.50"
                  borderRadius={8}
                  padding={4}
                  spacing={3}
                >
                  {getValidArray(filteredProcesses).map((entry) => {
                    const procedure = entry.process;
                    const isProcessArchived =
                      procedure?.archivedAt && procedure?.archivedAt !== null;
                    if (!procedure || isProcessArchived) {
                      return <></>;
                    }
                    return (
                      <HStack
                        key={`process-${procedure?.id}`}
                        width="full"
                        spacing={3}
                      >
                        {procedure?.documentType?.iconBuilder ? (
                          <IconBuilder
                            icon={procedure?.documentType?.iconBuilder}
                            size={24}
                            isActive
                          />
                        ) : (
                          <ProcedureIcon
                            procedureIcon={procedure?.procedureIcon}
                            size={24}
                          />
                        )}
                        <Text
                          color="gray.700"
                          fontSize="14px"
                          fontWeight={500}
                          lineHeight={5}
                          _hover={{
                            cursor: "pointer",
                            color: currentTheme?.primaryColor ?? primary700,
                            fontWeight: 700,
                          }}
                          onClick={() =>
                            navigate(
                              routes.processes.processId.value(
                                `${procedure.id}`
                              )
                            )
                          }
                        >
                          {procedure?.name}
                        </Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </VStack>
            </VStack>
          </VStack>
        </VStack>
        <VStack
          width="full"
          maxWidth={{ base: "full", md: "313px" }}
          align="flex-start"
          spacing={6}
        >
          <VStack
            width="full"
            align="flex-start"
            background="white"
            borderRadius={8}
            padding={4}
            spacing={4}
          >
            <Text
              color="gray.800"
              fontSize="lg"
              fontWeight={600}
              lineHeight={7}
            >
              Thumbnail
            </Text>
            <Image
              width="full"
              borderRadius={8}
              objectFit="contain"
              alt={collection?.mainMedia ?? ""}
              src={imageUrl ?? ""}
            />
          </VStack>
          {/* // TODO: Visibility feature, Integrate later
          <VStack width="full" align="flex-start" background="white" borderRadius={8} padding={4} spacing={4}>
            <Text color="gray.800" fontSize="lg" fontWeight={600} lineHeight={7}>
              Visibility
            </Text>
            <HStack>
              <Switch margin={0} isChecked={collection?.isVisible} isDisabled />
              <Text color="gray.700" fontSize="md" fontWeight={500} lineHeight={6}>
                Visible for Viewers
              </Text>
            </HStack>
          </VStack> */}
        </VStack>
      </Stack>
      {isOpenFilterProcess && (
        <FilterProcessModal
          isOpen={isOpenFilterProcess}
          onClose={() => setIsOpenFilterProcess(false)}
        />
      )}
    </VStack>
  );
};

export default observer(CollectionDetailPage);
