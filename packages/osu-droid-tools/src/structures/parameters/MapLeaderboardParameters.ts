import { MapInfo } from '@rian8337/osu-base';
import { ScoreSearchParameters } from '@structures/parameters';

export interface MapLeaderboardParameters extends Omit<ScoreSearchParameters, 'beatmapOrHash' | 'order'> {
  /**
   * The beatmap or its MD5 hash.
   */
  beatmapOrHash: MapInfo<true> | string;

  /**
   * Order scores by: `score`, `pp`. Defaults to `pp`.
   */
  order?: 'score' | 'pp';
}
