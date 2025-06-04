// API/ratings.ts
import { api, handleError } from 'API';
import { createCrudService } from 'API/crud';
import { createProcessRatings } from 'API/process';

// Literal union type for rating categories
export type RatingItemType = 'step' | 'block' | 'process';

// Convenience constants for rating types
export const RatingItemTypes = {
  STEP: 'step' as RatingItemType,
  BLOCK: 'block' as RatingItemType,
  PROCESS: 'process' as RatingItemType,
};

export interface RatingSubmission {
  itemId: string;
  itemType: RatingItemType;
  rating: number;
  comment: string;
  organizationId: string;
  userId: string;
}

export interface RatingWithRelations extends RatingSubmission {
  userName?: string;
  userImage?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalRatings: number;
}

// CRUD service for ratings
const ratingCrudService = createCrudService<
  RatingSubmission,
  RatingWithRelations
>('ratings');

/**
 * Submit a new rating
 */
export async function submitRating(data: RatingSubmission): Promise<void> {
  try {
    await ratingCrudService.create(data);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    handleError(error, 'API/ratings', 'submitRating');
  }
}

/**
 * Fetch reviews for a rating item
 */
export async function fetchReviews(
  itemType: RatingItemType,
  itemId: string
): Promise<ReviewsResponse> {
  try {
    const response = await api.get<ReviewsResponse>(
      `/ratings/${itemType}/${itemId}`
    );
    return response.data;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    handleError(error, 'API/ratings', 'fetchReviews');
    return { reviews: [], averageRating: 0, totalRatings: 0 };
  }
}

/**
 * Get user's rating for a specific item
 */
export async function getUserRating(
  itemType: RatingItemType,
  itemId: string,
  userId: string
): Promise<{ rating: number; comment: string } | null> {
  try {
    const response = await api.get<{ rating: number; comment: string }>(
      `/ratings/user/${userId}/${itemType}/${itemId}`
    );
    return response.data;
  } catch (err: unknown) {
    const anyErr = err as any;
    // If no rating exists, backend returns 404
    if (anyErr.response?.status === 404) {
      return null;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    handleError(error, 'API/ratings', 'getUserRating');
    return null;
  }
}

/**
 * Convert a RatingItemType value to a capitalized string
 */
export function getItemTypeTitle(itemType: RatingItemType): string {
  return itemType.charAt(0).toUpperCase() + itemType.slice(1);
}

export async function submitProcessRating(
  processId: string,
  rating: number,
  comment: string = '',
  organizationId?: string,
  userId?: string
): Promise<void> {
  try {
    if (!organizationId || !userId) {
      throw new Error(
        'organizationId and userId are required for rating submission'
      );
    }

    await createProcessRatings(processId, {
      processId,
      rating,
      review: comment,
      userId,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(error)
  }
}
