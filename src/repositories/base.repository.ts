import { db } from '@/lib/db';

export class BaseRepository {
  protected db = db;

  /** Expose db for transaction usage in service layer */
  getDb() {
    return this.db;
  }
}