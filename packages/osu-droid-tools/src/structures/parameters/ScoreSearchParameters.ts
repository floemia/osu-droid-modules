import { MapInfo } from '@rian8337/osu-base';
import { DroidUser } from '~DroidUser';

export interface ScoreSearchParameters {
  /**
   * An instance of `DroidUser`, their `id` or `username`.
   */
  user?: DroidUser | number | string;

  /**
   * The beatmap, if searching by beatmap.
   */
  beatmapOrHash?: MapInfo<true> | string;

  /**
   * Order scores by:
   * - `sid`: Score ID (ascending)
   * - `date`: Played at date (ascending)
   * - `score`: Score (highest first)
   * - `pp`: Performance (highest first)
   *
   * Defaults to `pp`.
   */
  order?: 'sid' | 'date' | 'score' | 'pp';

  /**
   * The current page. Defaults to 0.
   */
  page?: number;
}

export interface UserScoreSearchParameters extends Omit<ScoreSearchParameters, 'user'> {
  /**
   * An instance of `DroidUser`, their `id` or `username`.
   */
  user: DroidUser | number | string;
}
