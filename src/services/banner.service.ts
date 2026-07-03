import { BannerRepository } from '@/repositories/banner.repository';

export class BannerService {
  constructor(private bannerRepo: BannerRepository) {}

  async getPublicBanners() {
    return this.bannerRepo.findPublic();
  }

  async getAllBanners() {
    return this.bannerRepo.findAll();
  }

  async create(data: {
    title: string;
    link?: string;
    image?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    isPublic?: boolean;
  }) {
    return this.bannerRepo.create({
      title: data.title,
      link: data.link,
      image: data.image,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? true,
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) throw new Error('Banner not found');
    return this.bannerRepo.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate as string) : undefined,
      endDate: data.endDate ? new Date(data.endDate as string) : undefined,
    });
  }

  async delete(id: string) {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) throw new Error('Banner not found');
    await this.bannerRepo.delete(id);
    return { success: true };
  }
}