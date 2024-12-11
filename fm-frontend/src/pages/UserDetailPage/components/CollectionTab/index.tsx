// import {
//   Button,
//   Divider,
//   HStack,
//   IconButton,
//   Img,
//   Tag,
//   Text,
//   Tooltip,
//   VStack,
// } from "@chakra-ui/react";
// import missingImage from "assets/images/missing_image.png";
// import ConfirmModal from "components/Chakra/ConfirmModal";
// import CkTable, { IPagination } from "components/CkTable";
// import SearchInput from "components/SearchInput";
// import SvgIcon from "components/SvgIcon";
// import { S3FileTypeEnum } from "constants/aws";
// import dayjs from "dayjs";
// import { useStores } from "hooks/useStores";
// import { ICollection } from "interfaces/collection";
// import { ITheme } from "interfaces/theme";
// import debounce from "lodash/debounce";
// import { observer } from "mobx-react";
// import { filter } from "pages/UserDetailPage/constants";
// import { ReactNode, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import routes from "routes";
// // import { GlobalSearchDto } from "stores/searchStore";
// import { primary } from "themes/globalStyles";
// import { IFilter } from "types/common";
// import { getValidArray } from "utils/common";
// import { getS3FileUrl } from "utils/images";
// import ShareCollection from "../ShareCollection";
// import { getHeaderList } from "./utils";

const CollectionTab = () => {};
//   const { organizationStore, userStore } = useStores();
//   const {
//     isManageModeInUserDetail,
//     userDetail,
//     // userDetailCollections,
//     // countDetailCollection,
//   } = userStore;
//   const { organization } = organizationStore;
//   const organizationId: string = organization?.id ?? "";
//   const currentTheme: ITheme = organization?.theme ?? {};
//   const navigate = useNavigate();
//   const [pageSize, setPageSize] = useState<number>(20);
//   const [pageIndex, setPageIndex] = useState<number>(1);
//   const [searchKeyword, setSearchKeyword] = useState<string>("");
//   const [selectedCollection, setSelectedCollection] = useState<ICollection>();
//   const [isOpenShareModal, setIsOpenShareModal] = useState<boolean>(false);
//   const [isOpenUnshareModal, setIsOpenUnshareModal] = useState<boolean>(false);
//   const [isOpenOverviewModal, setIsOpenOverviewModal] =
//     useState<boolean>(false);
//   const [unshareText, setUnshareText] = useState<ReactNode>("");

//   const pagination: IPagination = {
//     gotoPage: setPageIndex,
//     pageIndex,
//     tableLength: 1,
//   };

//   const dataInTable = getValidArray(userDetailCollections).map(
//     (userDetailCollection) => {
//       const collection: ICollection =
//         userDetailCollection?.correlatingData as ICollection;
//       const image = collection?.mainMedia
//         ? getS3FileUrl(
//             S3FileTypeEnum.IMAGE,
//             organizationId,
//             collection?.mainMedia
//           )
//         : missingImage;
//       const sharedCollectionIds = getValidArray(
//         userDetail?.userCollections
//       ).map((userCollection) => userCollection?.collectionId);
//       const groupIdsOfCollection = getValidArray(
//         userDetailCollection?.groupIds
//       );
//       const groupIdsOfUser = getValidArray(userDetail?.groupMembers).map(
//         (groupMember) => groupMember?.groupId
//       );
//       const isSharedViaGroup = groupIdsOfCollection?.some((groupId) =>
//         groupIdsOfUser?.includes(groupId ?? "")
//       );
//       const isSharedDirectly =
//         sharedCollectionIds?.includes(collection?.id) ?? false;

//       function gotoCollectionDetail(): void {
//         navigate(`${routes.collections.value}/${collection?.id}`);
//       }

//       function getUnshareText(): void {
//         if (isSharedViaGroup && isSharedDirectly) {
//           setUnshareText(
//             <Text
//               color="gray.700"
//               fontSize="16px"
//               fontWeight={400}
//               lineHeight={6}
//             >
//               This user still has access to{" "}
//               <Text as="span" fontWeight={700}>
//                 {collection?.name}
//               </Text>{" "}
//               due to their group's permissions.
//             </Text>
//           );
//         } else {
//           setUnshareText(
//             <Text
//               color="gray.700"
//               fontSize="16px"
//               fontWeight={400}
//               lineHeight={6}
//             >
//               Are you sure you want unshare the collection{" "}
//               <Text as="span" fontWeight={700}>
//                 {collection?.name}
//               </Text>{" "}
//               with this User?
//             </Text>
//           );
//         }
//       }

//       return {
//         ...collection,
//         image: <Img width={10} height={10} src={image} borderRadius="8px" />,
//         updatedAt: collection?.updatedAt
//           ? dayjs(collection?.updatedAt).format("MM/DD/YYYY")
//           : "N/A",
//         name: (
//           <Text
//             onClick={gotoCollectionDetail}
//             _hover={{ color: currentTheme?.primaryColor ?? primary }}
//           >
//             {collection?.name}
//           </Text>
//         ),
//         shared: (
//           <HStack>
//             {isSharedViaGroup && (
//               <Tag
//                 size="md"
//                 variant="outline"
//                 width="max-content"
//                 background="gray.100"
//                 borderRadius={6}
//                 boxShadow="inset 0 0 0px 1px #CBD5E0"
//               >
//                 Via Group
//               </Tag>
//             )}
//             {isSharedDirectly && (
//               <Tag
//                 size="md"
//                 variant="outline"
//                 width="max-content"
//                 background="gray.100"
//                 borderRadius={6}
//                 boxShadow="inset 0 0 0px 1px #CBD5E0"
//               >
//                 Direct
//               </Tag>
//             )}
//           </HStack>
//         ),
//         action: (
//           <HStack justify="flex-end">
//             <Tooltip
//               label="Quick view"
//               height="36px"
//               fontSize="14px"
//               padding={2}
//               background="gray.700"
//               placement="top"
//               color="white"
//               hasArrow
//               borderRadius="4px"
//             >
//               <IconButton
//                 variant="ghost"
//                 colorScheme="#F7FAFC"
//                 aria-label="Call Segun"
//                 border="none"
//                 icon={<SvgIcon size={20} iconName="ic_detail" />}
//                 marginRight={
//                   isSharedDirectly || !isManageModeInUserDetail
//                     ? 0
//                     : "48px !important"
//                 }
//                 onClick={() => {
//                   setIsOpenOverviewModal(true);
//                   setSelectedCollection(collection);
//                 }}
//               />
//             </Tooltip>
//             {isManageModeInUserDetail && isSharedDirectly && (
//               <Tooltip
//                 label="Unshare"
//                 height="36px"
//                 fontSize="14px"
//                 padding={2}
//                 background="gray.700"
//                 placement="top"
//                 color="white"
//                 hasArrow
//                 borderRadius="4px"
//               >
//                 <IconButton
//                   variant="ghost"
//                   colorScheme="#F7FAFC"
//                   aria-label="Call Segun"
//                   border="none"
//                   icon={<SvgIcon size={20} iconName="unshare" />}
//                   onClick={() => {
//                     getUnshareText();
//                     setIsOpenUnshareModal(true);
//                     setSelectedCollection(collection);
//                   }}
//                 />
//               </Tooltip>
//             )}
//           </HStack>
//         ),
//       };
//     }
//   );

//   async function handleUnshareCollection(): Promise<void> {
//     try {
//       if (userDetail?.id && selectedCollection?.id) {
//         // await unshareCollection(userDetail?.id, selectedCollection?.id)
//         await userStore.getUserDetail(userDetail?.id, filter);
//         setIsOpenUnshareModal(false);

//         userStore.getDetailProcess({
//           where: {
//             searchText: "",
//             isPublished: true,
//             collectionName: "",
//             userId: userDetail?.id,
//           },
//           skip: 0,
//           limit: 10,
//           order: [""],
//         });

//         toast.success("Unshare collection successfully");
//       }
//     } catch (error: any) {
//       setIsOpenUnshareModal(false);
//       toast.error("Unshare collection failed");
//     }
//   }

//   async function fetchData(): Promise<void> {
//     try {
//       if (organizationId && userDetail.id) {
//         const filter: IFilter<GlobalSearchDto> = {
//           where: {
//             searchText: searchKeyword,
//             isPublished: true,
//             collectionName: "",
//             userId: userDetail?.id,
//           },
//           skip: pageSize * (pageIndex - 1),
//           limit: pageSize,
//           order: [""],
//         };

//         await userStore.getDetailCollection(filter);
//       }
//     } catch (error: any) {
//       console.log(error);
//     }
//   }

//   const debounceSearchKeyword = debounce((searchText: string) => {
//     setSearchKeyword(searchText);
//   }, 500);

//   useEffect(() => {
//     if (pageIndex !== 1) {
//       setPageIndex(1);
//     } else {
//       fetchData();
//     }
//   }, [searchKeyword, pageSize]);

//   useEffect(() => {
//     fetchData();
//   }, [userDetail, pageIndex]);

//   return (
//     <VStack width="full" align="flex-start" spacing={4}>
//       <HStack width="full" justify="space-between">
//         <SearchInput
//           width={336}
//           placeholder="Search collection by name"
//           onChange={(event) => debounceSearchKeyword(event.target.value)}
//         />
//         <Button
//           border={0}
//           color="white"
//           fontWeight={500}
//           lineHeight={6}
//           borderRadius={8}
//           hidden={!isManageModeInUserDetail}
//           onClick={() => setIsOpenShareModal(true)}
//           background={currentTheme?.primaryColor ?? primary}
//           _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
//           _active={{ background: currentTheme?.primaryColor ?? primary }}
//           leftIcon={<SvgIcon size={16} iconName="ic_share" color="white" />}
//         >
//           Share new collection
//         </Button>
//       </HStack>
//       <Divider border="2px solid #E2E8F0" />
//       <CkTable
//         headerList={getHeaderList()}
//         tableData={dataInTable}
//         pagination={pagination}
//         pageSize={pageSize}
//         setPageSize={setPageSize}
//         spacingX={4}
//         hasNoSort
//       />
//       {/* <CollectionOverview
//         collectionId={selectedCollection?.id}
//         isCentered
//         isOpen={isOpenOverviewModal}
//         toggle={setIsOpenOverviewModal}
//       /> */}
//       <ShareCollection
//         isOpen={isOpenShareModal}
//         onClose={() => setIsOpenShareModal(false)}
//       />
//       <ConfirmModal
//         titleText="Unshare collection?"
//         bodyText={unshareText}
//         confirmButtonText="Unshare"
//         isOpen={isOpenUnshareModal}
//         onClose={() => setIsOpenUnshareModal(false)}
//         onClickAccept={handleUnshareCollection}
//       />
//     </VStack>
//   );
// };

export default CollectionTab;
