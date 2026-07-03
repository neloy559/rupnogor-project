import { BaseRepository } from './base.repository';

export class NewsletterRepository extends BaseRepository {
  subscribe(email: string) {
    return this.db.newsletter.upsert({
      where: { email },
      create: { email },
      update: {},
    });
  }
}