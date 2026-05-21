import { PPLeaderboardUser, ScoreLeaderboardUser } from '@structures/responses';

/**
 * The type of leaderboard.
 */
export type LeaderboardType = 'pp' | 'score';

/**
 * The type of leaderboard user.
 */
export type LeaderboardUserType<T extends LeaderboardType> = T extends 'pp' ? PPLeaderboardUser : ScoreLeaderboardUser;

/**
 * Parameters for the `/leaderboard/` endpoint.
 */
export interface LeaderboardParameters {
  /**
   * Filter the leaderboard by country. Defaults to `all`.
   *
   * Must be [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) compliant.
   */
  region?: string;

  /**
   * The number of entries to fetch. Defaults to the maximum value, which is 50.
   */
  limit?: number;

  /**
   * The page to fetch. Defaults to 1.
   */
  page?: number;

  /**
   * The type of leaderboard to fetch. Defaults to `pp`.
   */
  type?: LeaderboardType;
}
