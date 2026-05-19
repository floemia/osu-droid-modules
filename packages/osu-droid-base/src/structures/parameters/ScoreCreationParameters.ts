import { Accuracy, MapInfo, ModMap, ScoreRank, SerializedMod } from '@rian8337/osu-base';

/**
 * Parameters for creating a generic osu!droid score.
 */
export interface ScoreCreationParameters {
  /**
   * The username of the user who submitted the score.
   */
  username?: string;

  /**
   * The ID of the user who submitted the score.
   */
  uid?: number;

  /**
   * The score's ID.
   */
  id?: number;

  /**
   * The `Date` the score was set at.
   */
  played_at?: Date;

  /**
   * The filename of the beatmap.
   */
  filename?: string;

  /**
   * The obtained score.
   */
  total_score?: number;

  /**
   * The obtained performance points.
   */
  pp?: number | null;

  /**
   * The achieved rank.
   */
  rank?: ScoreRank;

  /**
   * The achieved `Accuracy`.
   */
  accuracy?: Accuracy;

  /**
   * The maximum combo achieved.
   */
  max_combo?: number;

  /**
   * Number of Perfects (300s) obtained.
   */
  n300?: number;

  /**
   * Number of Goods (100s) obtained.
   */
  n100?: number;

  /**
   * Number of Bads (50s) obtained.
   */
  n50?: number;

  /**
   * Number of misses obtained.
   */
  nmiss?: number;

  /**
   * The mods applied to the score.
   */
  mods?: string | ModMap | SerializedMod[];

  /**
   * The amount of slider head hits. Can be `null` if the replay is missing from the server.
   */
  slider_head_hits?: number | null;

  /**
   * The amount of slider tick hits. Can be `null` if the replay is missing from the server.
   */
  slider_tick_hits?: number | null;

  /**
   * The amount of slider repeat hits. Can be `null` if the replay is missing from the server.
   */
  slider_repeat_hits?: number | null;

  /**
   * The amount of slider end hits. Can be `null` if the replay is missing from the server.
   */
  slider_end_hits?: number | null;

  /**
   * The beatmap of the score.
   */
  beatmapOrHash?: MapInfo<true> | string;
}
