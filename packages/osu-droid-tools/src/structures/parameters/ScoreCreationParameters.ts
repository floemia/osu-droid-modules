import { Accuracy, MapInfo, ModMap, ScoreRank, SerializedMod } from '@rian8337/osu-base';

/**
 * Parameters for creating a score.
 */
export interface ScoreCreationParameters {
  /**
   * The obtained accuracy.
   */
  accuracy?: Accuracy | number;

  /**
   * The obtained amount of 300s.
   */
  n300?: number;

  /**
   * The obtained amount of 100s.
   */
  n100?: number;

  /**
   * The obtained amount of 50s.
   */
  n50?: number;

  /**
   * The obtained amount of misses.
   */
  nmiss?: number;

  /**
   * The obtained amount of score.
   */
  score?: number;

  /**
   * The obtained performance points.
   */
  pp?: number;

  /**
   * The achieved rank.
   */
  rank?: ScoreRank;

  /**
   * The mods applied to the score.
   */
  mods?: string | ModMap | SerializedMod[];

  /**
   * The obtained max combo.
   */
  max_combo?: number;

  /**
   * The beatmap of the score.
   */
  beatmap?: MapInfo<true>;

  /**
   * Number of slider end hits.
   */
  slider_end_hits?: number;

  /**
   * Number of slider head hits.
   */
  slider_head_hits?: number;

  /**
   * Number of slider repeat hits.
   */
  slider_repeat_hits?: number;

  /**
   * Number of slider tick hits.
   */
  slider_tick_hits?: number;
}
