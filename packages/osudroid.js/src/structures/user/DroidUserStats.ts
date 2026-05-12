import { DroidUserRanks } from './DroidUserRanks';

/**
 * The statistics of a user.
 */
export interface DroidUserStats {
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
  rank: DroidUserRanks;
}
