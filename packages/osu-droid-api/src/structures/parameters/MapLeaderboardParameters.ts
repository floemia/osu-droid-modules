import { LeaderboardType } from './LeaderboardParameters';

/**
 * Parameters for requesting the leaderboard of a beatmap.
 */
export interface MapLeaderboardParameters {
  /**
   * The MD5 hash of the beatmap.
   */
  hash: string;

  /**
   * Type of leaderboard to request. Defaults to `score`.
   */
  type?: LeaderboardType;

  /**
   * If passed, will return the user's best score in the beatmap as `PersonalBest`, unless if the score is in the top 50.
   */
  uid?: number;
}
