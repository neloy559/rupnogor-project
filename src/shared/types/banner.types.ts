export interface Banner {
  id: string;
  title: string;
  link?: string | null;
  image?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title: string;
  link?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdateBannerRequest extends CreateBannerRequest {
  id: string;
}