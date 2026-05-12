import { MapInfo } from '@rian8337/osu-base';

/**
 * Parameters for
 */
export interface CompareParameters {
  /**
   * The beatmap to compare scores from.
   */
  beatmapOrHash: MapInfo | string;

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
}
