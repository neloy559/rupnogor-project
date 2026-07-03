export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  text?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email?: string;
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  text?: string;
}