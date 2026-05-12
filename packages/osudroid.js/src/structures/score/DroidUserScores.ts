import { DroidScore } from '~DroidScore';

/**
 * The scores of a user.
 */
export interface DroidUserScores {
  /**
   * The recent scores of the user.
   */
  recent: DroidScore[];
  /**
   * The best scores of the user.
   */
  best: DroidScore[];
}
