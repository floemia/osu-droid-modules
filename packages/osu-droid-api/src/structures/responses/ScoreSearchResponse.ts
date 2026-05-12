import { Mod, ScoreRank } from '@structures/osu';

/**
 * The raw score response from the `/score-search` endpoint.
 *
 * Contains information about a searched score.
 */
export interface ScoreSearchResponse {
  /**
   * The score's ID.
   */
  id: number;

  /**
   * The user's ID.
   */
  uid: number;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The filename of the beatmap.
   */
  filename: string;

  /**
   * The obtained score.
   */
  score: number;

  /**
   * The achieved max combo.
   */
  combo: number;

  /**
   * The achieved rank.
   */
  mark: ScoreRank;

  /**
   * The mode this score was set in.
   */
  mode: number;

  /**
   * The mods applied to the score.
   */
  mods: Mod[];

  /**
   * The achieved accuracy.
   */
  accuracy: number;

  /**
   * Amount of Perfect (300s) obtained.
   */
  perfect: number;

  /**
   * Amount of Geki obtained.
   */
  geki: number;

  /**
   * Amount of Good (100s) obtained.
   */
  good: number;

  /**
   * Amount of Katu obtained.
   */
  katu: number;

  /**
   * Amount of Bad (50s) obtained.
   */
  bad: number;

  /**
   * Amount of misses obtained.
   */
  miss: number;

  /**
   * The amount of slider head hits obtained.
   */
  sliderHeadHit: number | null;

  /**
   * The amount of slider ticks hits obtained.
   */
  sliderTickHit: number | null;

  /**
   * The amount of slider repeat hits obtained.
   */
  sliderRepeatHit: number | null;

  /**
   * The amount of slider end hits obtained.
   */
  sliderEndHit: number | null;

  /**
   * The date the score was set at. In seconds.
   */
  date: number;

  /**
   * The MD5 hash of the beatmap.
   */
  hash: string;

  /**
   * The PP obtained. Returns `null` if the beatmap is not ranked.
   */
  pp: number;

  /**
   *  The PP multiplier applied.
   */
  ppMultiplier: number;
}
