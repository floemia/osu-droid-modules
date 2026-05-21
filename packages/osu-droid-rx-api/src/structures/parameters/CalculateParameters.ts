/**
 * Parameters for the `/calculate` endpoint.
 */
export interface CalculateParameters {
  /**
   * The beatmap's ID.
   */
  id?: number;

  /**
   * The beatmap's MD5 hash.
   */
  md5?: string;

  /**
   * The mods applied to the score.
   */
  mods?: string;

  /**
   * The obtained accuracy.
   */
  acc?: number;

  /**
   * The maximum combo achieved.
   */
  max_combo?: number;

  /**
   * The amount of misses.
   */
  miss?: number;
}
