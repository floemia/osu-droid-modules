import { ScoreCreationParameters } from '@floemia/osu-droid-base';
/**
 * Used as a parameter for the `DroidScore` constructor.
 */
export interface ScoreData extends ScoreCreationParameters {
  /**
   * The ID of the score;
   */
  id: number;

  /**
   * The user ID of the user who submitted the score.
   */
  uid: number;

  /**
   * The username of the user who submitted the score.
   */
  username: string;

  /**
   * The `Date` the score was set at.
   */
  played_at: Date;

  /**
   * The amount of slider end hits.
   */
  slider_end_hits: number | null;
  /**
   * The amount of slider head hits.
   */
  slider_head_hits: number | null;

  /**
   * The amount of slider repeat hits.
   */
  slider_repeat_hits: number | null;

  /**
   * The amount of slider tick hits.
   */
  slider_tick_hits: number | null;
}
