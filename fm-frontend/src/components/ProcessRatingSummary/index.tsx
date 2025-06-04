import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import SvgIcon from 'components/SvgIcon';
import { EBreakPoint } from 'constants/theme';
import { formatDistanceToNow } from 'date-fns';
import useBreakPoint from 'hooks/useBreakPoint';
import { getValidArray } from 'utils/common';

// Define the interfaces for our props and data structures
interface Rating {
  id?: string;
  userName: string;
  avatar: string;
  rating: number;
  review?: string;
  createdAt: string;
}

interface RatingStarsProps {
  rating: number;
  size?: number;
}

interface ProcessRatingSummaryProps {
  process: any; // Replace with your actual Process type
  ratings: Rating[];
  canRate?: boolean;
  onRateProcess: () => void;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}

// Helper function to render star ratings
const RatingStars = ({ rating, size = 16 }: RatingStarsProps) => {
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <SvgIcon
          key={star}
          size={size}
          iconName={star <= rating ? 'star-filled' : 'star-outline'}
          color={star <= rating ? '#F6AD55' : '#CBD5E0'}
        />
      ))}
    </HStack>
  );
};

const ProcessRatingSummary = ({
  process, // Not used currently but keeping for future use
  ratings = [],
  canRate = true,
  onRateProcess,
  isCollapsed = false,
  onToggleCollapse,
}: ProcessRatingSummaryProps) => {
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  // Calculate average rating
  const averageRating = ratings.length
    ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
    : 0;

  // Format the average to one decimal place
  const formattedAverage = averageRating.toFixed(1);

  // Check if any ratings exist
  const hasRatings = ratings.length > 0;

  return (
    <Box
      bg="white"
      borderRadius="8px"
      boxShadow="sm"
      border="1px solid #E2E8F0"
      mb={4}
      overflow="hidden"
    >
      {/* Header Section - Mobile stacked, Desktop inline */}
      {isMobile ? (
        <VStack
          p={3}
          spacing={3}
          bg="gray.50"
          borderBottom={'none'}
          onClick={onToggleCollapse}
          cursor="pointer"
          transition="all 0.2s ease-in-out"
          align="stretch"
        >
          <HStack justifyContent="space-between">
            <HStack>
              <SvgIcon size={18} iconName="star-filled" color="#F6AD55" />
              <Text fontWeight="600" fontSize="sm">
                Ratings & Reviews {hasRatings && `(${ratings.length})`}
              </Text>
            </HStack>
            <Box
              transform={isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'}
              transition="transform 0.3s ease"
            >
              <SvgIcon size={18} iconName="chevron-down" color="gray.500" />
            </Box>
          </HStack>
          
          <HStack justifyContent="space-between">
            {hasRatings && (
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="sm">
                  {formattedAverage}
                </Text>
                <RatingStars rating={Math.round(averageRating)} size={12} />
              </HStack>
            )}
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRateProcess();
              }}
              isDisabled={!canRate}
              fontSize="xs"
              px={3}
            >
              Rate Process
            </Button>
          </HStack>
        </VStack>
      ) : (
        <HStack
          p={4}
          justifyContent="space-between"
          bg="gray.50"
          borderBottom={'none'}
          onClick={onToggleCollapse}
          cursor="pointer"
          transition="all 0.2s ease-in-out"
        >
          <HStack>
            <SvgIcon size={20} iconName="star-filled" color="#F6AD55" />
            <Text fontWeight="600" fontSize="md">
              Ratings & Reviews {hasRatings && `(${ratings.length})`}
            </Text>
          </HStack>
          <HStack>
            {hasRatings && (
              <HStack spacing={2} mr={2}>
                <Text fontWeight="bold" fontSize="md">
                  {formattedAverage}
                </Text>
                <RatingStars rating={Math.round(averageRating)} />
              </HStack>
            )}
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRateProcess();
              }}
              isDisabled={!canRate}
            >
              Rate Process
            </Button>
            <Box
              transform={isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'}
              transition="transform 0.3s ease"
            >
              <SvgIcon size={20} iconName="chevron-down" color="gray.500" />
            </Box>
          </HStack>
        </HStack>
      )}

      {/* Smooth animated collapse for reviews section */}
      <Collapse in={!isCollapsed} animateOpacity>
        <Box p={isMobile ? 3 : 4}>
          {!hasRatings ? (
            <Box textAlign="center" py={isMobile ? 4 : 6}>
              <Text color="gray.500" fontSize={isMobile ? "sm" : "md"}>
                No ratings yet. Be the first to rate this process!
              </Text>
            </Box>
          ) : (
            <VStack spacing={isMobile ? 3 : 4} align="stretch">
              {getValidArray(ratings).map((rating, index) => (
                <Box key={rating.id || index}>
                  <Flex 
                    alignItems="flex-start"
                    direction={isMobile ? "column" : "row"}
                    gap={isMobile ? 2 : 0}
                  >
                    <Flex alignItems="center" mb={isMobile ? 2 : 0}>
                      <Avatar
                        size={isMobile ? "xs" : "sm"}
                        name={rating?.userName ?? ''}
                        mr={3}
                        src={rating?.avatar ?? ''}
                      />
                      {isMobile && (
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="500" fontSize="sm">
                            {rating.userName}
                          </Text>
                          <RatingStars rating={rating.rating} size={12} />
                        </VStack>
                      )}
                    </Flex>
                    
                    <Box flex="1">
                      {!isMobile && (
                        <>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Text fontWeight="500">{rating.userName}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatDistanceToNow(new Date(rating.createdAt), {
                                addSuffix: true,
                              })}
                            </Text>
                          </Flex>
                          <RatingStars rating={rating.rating} size={14} />
                        </>
                      )}
                      
                      {isMobile && (
                        <Text fontSize="xs" color="gray.500" mb={2}>
                          {formatDistanceToNow(new Date(rating.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                      )}
                      
                      {rating.review && (
                        <Text 
                          mt={isMobile ? 1 : 2} 
                          fontSize={isMobile ? "xs" : "sm"}
                          lineHeight={isMobile ? "1.4" : "1.5"}
                        >
                          {rating.review}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  {index < ratings.length - 1 && <Divider mt={isMobile ? 3 : 4} />}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProcessRatingSummary;