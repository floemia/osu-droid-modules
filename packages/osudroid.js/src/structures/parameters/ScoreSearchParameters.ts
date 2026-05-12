import { DroidUser } from '~DroidUser';

export interface ScoreSearchParameters {
  /**
   * An instance of `DroidUser`, their `id` or `username`.
   */
  user: DroidUser | number | string;

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
   * Defaults to `sid`.
   */
  order?: 'sid' | 'date' | 'score' | 'pp';

  /**
   * The current page. Defaults to 0.
   */
  page?: number;
}
