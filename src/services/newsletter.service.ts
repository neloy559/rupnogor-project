import { NewsletterRepository } from '@/repositories/newsletter.repository';

export class NewsletterService {
  constructor(private newsletterRepo: NewsletterRepository) {}

  async subscribe(email: string) {
    await this.newsletterRepo.subscribe(email.toLowerCase().trim());
    return { success: true, message: 'Subscribed successfully' };
  }
}