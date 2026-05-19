import { UserStats } from '~User';

/**
 * Parameters for creating a generic osu!droid user.
 */
export interface UserCreationParameters {
  /**
   * The user's ID.
   */
  id?: number;

  /**
   * The user's username.
   */
  username?: string;

  /**
   * The user's avatar URL.
   */
  avatar_url?: string;

  /**
   * The user's country.
   */
  country?: string;

  /**
   * The user's page URL.
   */
  url?: string;

  /**
   * The user's statistics.
   */
  statistics?: UserStats;
}
