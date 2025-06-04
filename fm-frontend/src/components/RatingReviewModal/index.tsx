import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { submitProcessRating } from 'API/ratings';
import SvgIcon from 'components/SvgIcon';
import { useStores } from 'hooks/useStores';
import { IProcess } from 'interfaces/process';
import { ITheme } from 'interfaces/theme';
import { useState } from 'react';
import { toast } from 'react-toastify';

// Define props interface
interface RatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: IProcess | null;
  userId: string;
  userName: string;
  fetchProcessRatings: () => void;
}

const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  isOpen,
  onClose,
  process,
  userId,
  userName,
  fetchProcessRatings,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { organizationStore } = useStores();
  const { organization } = organizationStore;

  const currentTheme: ITheme = organization?.theme ?? {};

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!process) {
      toast.error('Process information is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call to submit the rating and review
      // Fixed parameter order: processId, rating, comment, organizationId, userId
      await submitProcessRating(
        process.id,
        rating, // Changed from userId to rating (number)
        review, // Comment/review text
        process.organizationId || '', // Added organizationId from process
        userId // User ID
      );

      toast.success('Your rating has been submitted successfully');
      fetchProcessRatings();
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton
          background="white"
          border="none"
          variant="outline"
          _focus={{ borderColor: 'unset' }}
          _active={{ borderColor: 'unset' }}
        />
        <DrawerHeader borderBottomWidth="1px">
          Rate & Review Process
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="flex-start" width="100%" pt={4}>
            <Box width="100%">
              <Text fontWeight="500" mb={2}>
                Process: {process?.name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Share your experience with this process to help others
              </Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="500">Rating</FormLabel>
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Box
                    key={star}
                    cursor="pointer"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <SvgIcon
                      size={28}
                      iconName={
                        star <= (hoveredRating || rating)
                          ? 'star-filled'
                          : 'star-outline'
                      }
                      color={
                        star <= (hoveredRating || rating)
                          ? '#F6AD55' // Orange color for filled stars
                          : '#CBD5E0' // Gray color for unfilled stars
                      }
                    />
                  </Box>
                ))}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="500">Review (Optional)</FormLabel>
              <Textarea
                placeholder="Share your thoughts about this process..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={6}
                resize="vertical"
              />
            </FormControl>
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button
            variant="outline"
            mr={3}
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            color={'white'}
            background={currentTheme?.primaryColor ?? 'primary.500'}
            _hover={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _focus={{
              background: currentTheme?.primaryColor ?? 'primary.700',
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Rating
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RatingReviewModal;
