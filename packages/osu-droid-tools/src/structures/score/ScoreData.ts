import { Accuracy, MapInfo, ModMap, ScoreRank } from '@rian8337/osu-base';
/**
 * Used as a parameter for the `DroidScore` constructor.
 */
export interface ScoreData {
  /**
   * The user's ID.
   */
  uid?: number;
  /**
   * The user's username.
   */
  username?: string;
  /**
   * The score's ID.
   */
  id: number;
  /**
   * The filename of the beatmap.
   */
  filename: string;
  /**
   * The obtained amount of score.
   */
  total_score: number;
  /**
   * The obtained performance points.
   * Returns `null` if the beatmap is not ranked.
   */
  pp: number | null;
  /**
   * The achieved rank.
   */
  rank: ScoreRank;
  /**
   * The obtained accuracy.
   */
  accuracy: Accuracy;
  /**
   * The max combo achieved.
   */
  max_combo: number;
  /**
   * The `Date` the score was set at.
   */
  played_at: Date;
  /**
   * The beatmap's MD5 hash.
   * Use it to obtain the beatmap.
   */
  hash: string;
  /**
   * The applied mods.
   */
  mods: ModMap;
  /**
   * The amount of slider end hits. Can be `null` if the replay is missing from the server.
   */
  slider_end_hits: number | null;
  /**
   * The amount of slider head hits. Can be `null` if the replay is missing from the server.
   */
  slider_head_hits: number | null;
  /**
   * The amount of slider repeat hits. Can be `null` if the replay is missing from the server.
   */
  slider_repeat_hits: number | null;
  /**
   * The amount of slider tick hits. Can be `null` if the replay is missing from the server.
   */
  slider_tick_hits: number | null;
  /**
   * The beatmap of the score.
   */
  beatmap?: MapInfo | undefined;
}
