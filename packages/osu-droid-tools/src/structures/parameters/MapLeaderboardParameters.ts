import { MapInfo } from '@rian8337/osu-base';
import { ScoreSearchParameters } from '@structures/parameters';

/**
 * Parameters for requesting a beatmap's leaderboard.
 */
export interface MapLeaderboardParameters extends Omit<ScoreSearchParameters, 'beatmapOrHash' | 'order' | 'user'> {
  /**
   * The beatmap or its MD5 hash.
   */
  beatmapOrHash: MapInfo<true> | string;

  /**
   * Order scores by: `score`, `pp`. Defaults to `pp`.
   */
  order?: 'score' | 'pp';
}
