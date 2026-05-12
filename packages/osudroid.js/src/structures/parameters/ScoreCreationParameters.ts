import { Accuracy, MapInfo, ModMap, ScoreRank, SerializedMod } from '@rian8337/osu-base';

/**
 * Parameters for creating a score.
 */
export interface ScoreCreationParameters {
  /**
   * The obtained accuracy.
   */
  accuracy?: Accuracy;

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
}
