/**
 * The PP ranks of a user.
 */
export interface DroidUserRanks {
  /**
   * The global rank of the user.
   */
  global: number;

  /**
   * The country rank of the user.
   */
  country: number | null;
}
