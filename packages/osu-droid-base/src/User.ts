import { UserCreationParameters } from '@structures/parameters';

/**
 * The PP ranks of a user.
 */
export interface UserRanks {
  /**
   * The global rank of the user.
   */
  global: number;

  /**
   * The country rank of the user.
   */
  country: number | null;
}

/**
 * The statistics of a user.
 */
export interface UserStats {
  /**
   * The number of plays the user has made.
   */
  playcount: number;

  /**
   * The total score of the user.
   */
  total_score: number;

  /**
   * The user's performance points.
   */
  pp: number;

  /**
   * The user's accuracy.
   *
   * (0-1)
   */
  accuracy: number;

  /**
   * The user's PP ranks.
   */
  rank: UserRanks;
}

/**
 * A class representing a generic osu!droid user.
 */
export class User {
  /**
   * The user's ID.
   */
  id: number;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's hypothetical avatar URL.
   *
   * If the user has no avatar, the URL will be invalid. Proceed with caution.
   */
  avatar_url: string;

  /**
   * The user's country.
   */
  country: string | null;

  /**
   * The user's page URL.
   */
  url: string;

  /**
   * The user's statistics.
   */
  statistics: UserStats;

  constructor(input: UserCreationParameters) {
    const { id = NaN, username = '', avatar_url = '', country = null, url = '', statistics } = input;
    this.id = id;
    this.username = username;
    this.avatar_url = avatar_url;
    this.country = country;
    this.url = url;
    this.statistics = statistics ?? {
      playcount: 0,
      total_score: 0,
      pp: 0,
      accuracy: 0,
      rank: {
        global: 0,
        country: null,
      },
    };
  }
}
