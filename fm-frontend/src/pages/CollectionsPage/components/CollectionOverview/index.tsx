import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  HStack,
  IconButton,
  Image,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import { toggleFavorite } from 'API/favorite';
import { ReactComponent as FavoriteIcon } from 'assets/icons/favorite.svg';
import { ReactComponent as UnFavoriteIcon } from 'assets/icons/un_favorite.svg';
import imgPlaceholder from 'assets/images/missing_image.png';
import Spinner from 'components/Spinner';
import SvgIcon from 'components/SvgIcon';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import { ICollectionsProcess } from 'interfaces/collection';
import { EIconDefaultId } from 'interfaces/iconBuilder';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { ITheme } from '../../../../interfaces/theme';
import styles from './collectionOverview.module.scss';
import {
  Button,
  CollectionName,
  ProcessName,
  TextTitle,
} from './collectionOverview.styles';

interface ICollectionOverviewProps {
  collectionId?: string;
  isOpen?: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  isCentered?: boolean;
}

const PROCESSES_LIMIT = 6;

const CollectionOverview = (props: ICollectionOverviewProps) => {
  const { isOpen = false, toggle, collectionId } = props;
  const {
    collectionStore,
    organizationStore,
    iconBuilderStore,
    favoriteStore,
  } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { overviewCollection } = collectionStore;
  const collectionsProcesses: ICollectionsProcess[] = getValidArray(
    overviewCollection?.collectionsProcesses
  );
  const mediaList: ICollectionsProcess[] = getValidArray(
    overviewCollection?.collectionsProcesses
  ).filter((collectionsProcess) => collectionsProcess?.process?.image);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [processes, setProcesses] = useState<ICollectionsProcess[]>([]);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  function handlePrevProcesses(): void {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function handleNextProcesses(): void {
    if (page < collectionsProcesses?.length / PROCESSES_LIMIT) {
      setPage(page + 1);
    }
  }

  function handleScrollLeft(): void {
    if (mediaRef.current) {
      mediaRef.current.scrollLeft -= 512;
    }
  }

  function handleScrollRight(): void {
    if (mediaRef.current) {
      mediaRef.current.scrollLeft += 512;
    }
  }

  function handleFavorite(): void {
    setIsFavorite(!isFavorite);
    toggleFavorite({ collectionId });
  }

  function handleCloseModal(): void {
    toggle(false);
    setPage(1);
  }

  useEffect(() => {
    const start = (page - 1) * PROCESSES_LIMIT;
    const end = start + PROCESSES_LIMIT;
    setProcesses(
      getValidArray(overviewCollection?.collectionsProcesses).slice(start, end)
    );
  }, [overviewCollection, page]);

  useEffect(() => {
    if (isOpen && collectionId) {
      setIsLoading(true);
      favoriteStore.getIsFavorite({ collectionId }).then((res: boolean) => {
        setIsFavorite(res);
      });
      collectionStore
        .getOverviewCollection(collectionId)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== imgPlaceholder) {
      evt.currentTarget.src = imgPlaceholder;
    }
  }

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={handleCloseModal}>
      <ModalOverlay />
      <ModalContent maxWidth="600px" borderRadius={8}>
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          fontWeight={500}
          lineHeight={7}
        >
          Collection Summary
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: 'unset' }}
          _active={{ borderColor: 'unset' }}
        />
        <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
          {isLoading ? (
            <Spinner />
          ) : (
            <VStack width="full" align="flex-start" spacing={6}>
              <HStack width="full" justify="space-between">
                <HStack>
                  {overviewCollection?.mainMedia ? (
                    <Img
                      width={12}
                      height={12}
                      src={overviewCollection?.mainMedia}
                      onError={onImgError}
                      borderRadius="8px"
                    />
                  ) : (
                    <SvgIcon
                      size={48}
                      width={48}
                      height={48}
                      iconName="collections"
                    />
                  )}
                  <CollectionName
                    _hover={{
                      color: currentTheme?.primaryColor ?? 'primary.500',
                    }}
                    onClick={() =>
                      navigate(
                        routes.collections.collectionId.value(`${collectionId}`)
                      )
                    }
                  >
                    {overviewCollection?.name}
                  </CollectionName>
                </HStack>
                <IconButton
                  aria-label="Favorite"
                  background="gray.100"
                  borderRadius="50%"
                  border={0}
                  icon={isFavorite ? <FavoriteIcon /> : <UnFavoriteIcon />}
                  onClick={handleFavorite}
                />
              </HStack>
              <VStack width="full" align="flex-start" spacing={4}>
                <HStack align="flex-start" spacing={6}>
                  <TextTitle>Last Updated</TextTitle>
                  <Text
                    fontSize="md"
                    fontWeight={400}
                    lineHeight={6}
                    color="gray.700"
                  >
                    {dayjs(overviewCollection?.updatedAt).format(
                      'MMMM DD, YYYY'
                    )}
                  </Text>
                </HStack>
                <HStack align="flex-start" spacing={6}>
                  <TextTitle>Publish Date</TextTitle>
                  <Text
                    fontSize="md"
                    fontWeight={400}
                    lineHeight={6}
                    color="gray.700"
                  >
                    {dayjs(
                      overviewCollection?.publishedDate ??
                        overviewCollection?.createdAt
                    ).format('MMMM DD, YYYY')}
                  </Text>
                </HStack>
                <HStack
                  className={styles.description}
                  align="flex-start"
                  spacing={6}
                >
                  <TextTitle>Description</TextTitle>
                  <Text
                    fontSize="md"
                    fontWeight={400}
                    lineHeight={6}
                    color="gray.700"
                    dangerouslySetInnerHTML={{
                      __html: overviewCollection?.overview ?? '',
                    }}
                  />
                </HStack>
                <HStack align="flex-start" spacing={6}>
                  <TextTitle>Groups</TextTitle>
                  <Wrap>
                    {getValidArray(overviewCollection?.collectionGroups).map(
                      (collectionGroup) => (
                        <Tag
                          key={collectionGroup?.group?.id}
                          size="md"
                          color="gray.700"
                          border="1px solid #E2E8F0"
                          padding={2}
                        >
                          {collectionGroup?.group?.name}
                        </Tag>
                      )
                    )}
                  </Wrap>
                </HStack>
                <VStack width="full" align="flex-start" spacing={3}>
                  <HStack width="full" justify="space-between">
                    <TextTitle>Processes</TextTitle>
                    {collectionsProcesses?.length > PROCESSES_LIMIT && (
                      <HStack spacing={0}>
                        <Button onClick={handlePrevProcesses}>
                          <ChevronLeftIcon
                            width="24px"
                            height="24px"
                            color="gray.600"
                          />
                        </Button>
                        <Button onClick={handleNextProcesses}>
                          <ChevronRightIcon
                            width="24px"
                            height="24px"
                            color="gray.600"
                          />
                        </Button>
                      </HStack>
                    )}
                  </HStack>
                  {getValidArray(processes).map((collectionsProcess) => {
                    const { process, processId } = collectionsProcess;
                    return (
                      <HStack key={processId} cursor="pointer">
                        <IconBuilder
                          icon={iconBuilderStore.getIconById(
                            process?.documentType?.iconId ??
                              EIconDefaultId.DOCUMENT_TYPE
                          )}
                          size={24}
                          isActive
                        />
                        <ProcessName
                          _hover={{
                            color: currentTheme?.primaryColor ?? 'primary.500',
                          }}
                          onClick={() =>
                            navigate(
                              routes.processes.processId.value(`${processId}`)
                            )
                          }
                        >
                          {process?.name}
                        </ProcessName>
                      </HStack>
                    );
                  })}
                </VStack>
                <VStack width="full" align="flex-start" spacing={3}>
                  <HStack width="full" justify="space-between">
                    <TextTitle>Media</TextTitle>
                    {mediaList?.length > 4 && (
                      <HStack spacing={0}>
                        <Button onClick={handleScrollLeft}>
                          <ChevronLeftIcon
                            width="24px"
                            height="24px"
                            color="gray.600"
                          />
                        </Button>
                        <Button onClick={handleScrollRight}>
                          <ChevronRightIcon
                            width="24px"
                            height="24px"
                            color="gray.600"
                          />
                        </Button>
                      </HStack>
                    )}
                  </HStack>
                  <HStack ref={mediaRef} overflowX="hidden" width="600px">
                    {getValidArray(mediaList).map(
                      (media: ICollectionsProcess, index: number) => {
                        if (media?.process?.image) {
                          return (
                            <Image
                              width="120px"
                              height="90px"
                              minWidth="120px"
                              src={organizationStore.organization?.id ?? ''}
                              onError={onImgError}
                              alt={media?.process?.name ?? ''}
                              key={media?.process?.id ?? index}
                            />
                          );
                        }
                        return null;
                      }
                    )}
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CollectionOverview;
