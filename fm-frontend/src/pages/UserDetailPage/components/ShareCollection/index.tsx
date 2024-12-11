// import { useEffect, useState } from 'react'
// import {
//   Button,
//   Checkbox,
//   HStack,
//   Img,
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalCloseButton,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Text,
//   VStack
// } from '@chakra-ui/react'
// import missingImage from 'assets/images/missing_image.png'
// import { useStores } from 'hooks/useStores'
// import debounce from 'lodash/debounce'
// import { observer } from 'mobx-react'
// import { toast } from 'react-toastify'
// import { primary } from 'theme/globalStyles'
// import { aggregateCollection, getCollectionsByFilter } from 'API/collection'
// import { getUserById, shareCollections } from 'API/user'
// import SearchInput from 'components/SearchInput'
// import Spinner from 'components/Spinner'
// import { S3FileTypeEnum } from 'constants/aws'
// import { EEsGlobalSearchCollection } from 'constants/elasticSearch'
// import { ICollection } from 'interfaces/collection'
// import { ITheme } from 'interfaces/theme'
// import { filter } from 'pages/UserDetailPage/constants'
// import { getValidArray } from 'utils/common'
// import { getS3FileUrl } from 'utils/images'

// interface IShareCollectionProps {
//   isOpen: boolean
//   onClose: () => void
// }

const ShareCollection = () => {};
// const ShareCollection = (props: IShareCollectionProps) => {
//   const { isOpen, onClose } = props
//   const { organizationStore, userStore } = useStores()
//   const { userDetail } = userStore
//   const { organization } = organizationStore
//   const organizationId: number = organization?.id ?? 0
//   const currentTheme: ITheme = organization?.theme ?? {}
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
//   const [searchKeyword, setSearchKeyword] = useState<string>('')
//   const [collectionOptions, setCollectionOptions] = useState<ICollection[]>([])
//   const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([])
//   const [sharedViaGroupCollectionIds, setSharedViaGroupCollectionIds] = useState<number[]>([])

//   function handleSelectCollection(collectionId: number): void {
//     if (selectedCollectionIds?.includes(collectionId)) {
//       setSelectedCollectionIds(prevIds => prevIds.filter(id => id !== collectionId))
//     } else {
//       setSelectedCollectionIds(prevIds => [...prevIds, collectionId])
//     }
//   }

//   function handleClose(): void {
//     onClose()
//     setSearchKeyword('')
//     setSelectedCollectionIds([])
//   }

//   async function handleShareCollections(): Promise<void> {
//     try {
//       setIsSubmitting(true)
//       if (userDetail?.id && selectedCollectionIds?.length > 0) {
//         await shareCollections(userDetail?.id, selectedCollectionIds)
//         await userStore.getUserDetail(userDetail?.id, filter)

//         userStore.getDetailProcess({
//           where: {
//             searchText: '',
//             isPublished: true,
//             collectionName: EEsGlobalSearchCollection.PROCESS,
//             userId: userDetail?.id
//           },
//           skip: 0,
//           limit: 10,
//           order: ['']
//         })
//       }
//       handleClose()
//       setIsSubmitting(false)
//       toast.success('Share collection successfully')
//     } catch (error: any) {
//       setIsSubmitting(false)
//       toast.error('Share collection failed')
//     }
//   }

//   async function fetchData(): Promise<void> {
//     setIsLoading(true)
//     const user = await getUserById(userDetail?.id ?? 0, { include: ['userCollections', 'groupMembers'] })
//     const sharedDirectCollectionIds: number[] = getValidArray(user?.userCollections)?.map(
//       userCollection => userCollection?.collectionId
//     )
//     const pipeline = [
//       {
//         $match: {
//           organizationId,
//           name: { $regex: searchKeyword, $options: 'i' },
//           $or: [{ archivedAt: { $exists: false } }, { archivedAt: { $eq: null } }],
//           _id: { $nin: sharedDirectCollectionIds }
//         }
//       },
//       {
//         $lookup: {
//           from: 'CollectionGroup',
//           localField: '_id',
//           foreignField: 'collectionId',
//           as: 'collectionGroups'
//         }
//       },
//       {
//         $project: {
//           id: '$_id',
//           name: 1,
//           mainMedia: 1,
//           groupIds: {
//             $map: {
//               input: '$collectionGroups',
//               as: 'collectionGroup',
//               in: '$$collectionGroup.groupId'
//             }
//           }
//         }
//       }
//     ]
//     const collectionData: ICollection[] = await aggregateCollection(pipeline)
//     setCollectionOptions(collectionData)
//     const userGroups = getValidArray(user?.groupMembers).map(groupMember => groupMember?.groupId)
//     setSharedViaGroupCollectionIds(
//       collectionData
//         .filter(collection => collection?.groupIds?.some(id => userGroups?.includes(id)))
//         .map(collection => collection?.id)
//     )

//     setIsLoading(false)
//   }

//   const debounceSearchKeyword = debounce((searchText: string) => {
//     setSearchKeyword(searchText)
//   }, 500)

//   useEffect(() => {
//     if (isOpen) {
//       fetchData()
//     }
//   }, [isOpen, searchKeyword])

//   return (
//     <Modal size="2xl" isOpen={isOpen} onClose={handleClose}>
//       <ModalOverlay />
//       <ModalContent maxWidth="600px" borderRadius={8}>
//         <ModalHeader color="gray.800" fontSize="18px" fontWeight={500} lineHeight={7}>
//           Share new collection
//         </ModalHeader>
//         <ModalCloseButton
//           boxShadow="unset"
//           border="unset"
//           background="#fff"
//           _focus={{ borderColor: 'unset' }}
//           _active={{ borderColor: 'unset' }}
//         />
//         <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
//           <VStack width="full" minHeight="200px" alignItems="flex-start" spacing={3}>
//             <HStack width="full">
//               <SearchInput
//                 placeholder="Search collection by name"
//                 onChange={event => debounceSearchKeyword(event.target.value)}
//               />
//               <Text
//                 as="u"
//                 minWidth="max-content"
//                 fontSize="md"
//                 color="gray.600"
//                 cursor="pointer"
//                 onClick={() => setSelectedCollectionIds([])}
//               >
//                 Clear all
//               </Text>
//             </HStack>
//             {isLoading ? (
//               <Spinner />
//             ) : (
//               <VStack
//                 width="full"
//                 maxHeight="368px"
//                 overflowY="scroll"
//                 alignItems="flex-start"
//                 background="gray.50"
//                 paddingY={2}
//                 spacing={0}
//               >
//                 {getValidArray(collectionOptions).map(collection => {
//                   const imageUrl: string = collection?.mainMedia
//                     ? getS3FileUrl(S3FileTypeEnum.IMAGE, organizationId, collection?.mainMedia)
//                     : missingImage
//                   const isChecked: boolean = selectedCollectionIds?.includes(collection?.id)
//                   const isSharedViaGroup: boolean = sharedViaGroupCollectionIds.includes(collection?.id)
//                   function onClick(): void {
//                     if (sharedViaGroupCollectionIds.includes(collection?.id)) {
//                       return
//                     }
//                     handleSelectCollection(collection?.id)
//                   }
//                   return (
//                     <HStack
//                       key={collection?.id}
//                       width="full"
//                       spacing={0}
//                       align="center"
//                       opacity={isSharedViaGroup ? 0.5 : 1}
//                       background={isChecked ? 'primary.100' : 'white'}
//                       cursor={isSharedViaGroup ? 'not-allowed' : 'pointer'}
//                       _hover={{ background: isSharedViaGroup ? 'white' : 'primary.100' }}
//                     >
//                       {!isSharedViaGroup && <Checkbox margin="0 12px" isChecked={isChecked} onChange={onClick} />}
//                       <HStack width="full" justify="space-between" onClick={onClick}>
//                         <HStack padding={2} spacing={3} marginLeft={isSharedViaGroup ? '40px !important' : '0'}>
//                           <Img boxSize={6} src={imageUrl} borderRadius={4} />
//                           <Text color="#313A46" fontSize="14px" fontWeight={500} lineHeight={5}>
//                             {collection?.name}
//                           </Text>
//                         </HStack>
//                         {isSharedViaGroup && (
//                           <Text
//                             width="max-content"
//                             color="gray.700"
//                             fontSize="12px"
//                             fontWeight="500"
//                             fontStyle="italic"
//                             paddingRight={2}
//                           >
//                             Collection has been shared via group
//                           </Text>
//                         )}
//                       </HStack>
//                     </HStack>
//                   )
//                 })}
//               </VStack>
//             )}
//           </VStack>
//         </ModalBody>
//         <ModalFooter borderTop="1px solid #E2E8F0">
//           <HStack width="full" justifyContent="flex-end" spacing={4}>
//             <Button
//               color="gray.700"
//               background="white"
//               fontSize="16px"
//               fontWeight={500}
//               lineHeight={6}
//               border="1px solid #E2E8F0"
//               isLoading={isSubmitting}
//               onClick={handleClose}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               border="0"
//               color="white"
//               fontSize="16px"
//               fontWeight={500}
//               lineHeight={6}
//               isLoading={isSubmitting}
//               onClick={handleShareCollections}
//               background={currentTheme?.primaryColor ?? primary}
//               _hover={{ opacity: currentTheme?.primaryColor ? 0.8 : 1 }}
//               _active={{ background: currentTheme?.primaryColor ?? primary }}
//             >
//               Share
//             </Button>
//           </HStack>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   )
// }

export default ShareCollection;
