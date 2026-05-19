/**
 * Parameters for the `/score-search/` endpoint.
 */
export interface SearchRequestParameters {
  /**
   * The user's id or username, if searching by user.
   */
  user?: number | string;

  /**
   * The beatmap's MD5 hash, if searching by beatmap.
   */
  hash?: string;

  /**
   * Order scores by:
   * - `sid`: Score ID (ascending)
   * - `date`: Played at date (ascending)
   * - `score`: Score (highest first)
   * - `pp`: Performance (highest first)
   *
   * Defaults to `score`.
   */
  order?: 'sid' | 'date' | 'score' | 'pp';

  /**
   * The current page. Defaults to 0.
   */
  page?: number;
}
