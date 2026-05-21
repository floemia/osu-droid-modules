/**
 * Represents an osu!droid mod.
 */
export interface Mod {
  /**
   * The acronym of the mod.
   */
  readonly acronym: string;

  /**
   * The mod's settings, if applicable.
   */
  readonly settings?: Record<string, unknown>;
}

/**
 * Achievable ranks in a score.
 */
export type ScoreRank = 'XH' | 'SH' | 'X' | 'S' | 'A' | 'B' | 'C' | 'D';

/**
 * The raw score response from the `/profile-uid` and `/profile-username` endpoints.
 *
 * Contains information about a score.
 */
export interface ScoreResponse {
  /**
   * The score's ID.
   */
  ScoreId: number;

  /**
   * The filename of the beatmap.
   */
  Filename: string;

  /**
   * The MD5 hash of the beatmap.
   */
  MapHash: string;

  /**
   * The mods applied to the score.
   */
  Mods: Mod[];

  /**
   * The obtained score.
   */
  MapScore: number;

  /**
   * The achieved max combo.
   */
  MapCombo: number;

  /**
   * The achieved rank.
   */
  MapRank: ScoreRank;

  /**
   * Amount of Geki obtained.
   */
  MapGeki: number;

  /**
   * Amount of Perfect (300s) obtained.
   */
  MapPerfect: number;

  /**
   * Amount of Katu obtained.
   */
  MapKatu: number;

  /**
   * Amount of Good (100s) obtained.
   */
  MapGood: number;

  /**
   * Amount of Bad (50s) obtained.
   */
  MapBad: number;

  /**
   * Amount of misses obtained.
   */
  MapMiss: number;

  /**
   * The amount of slider head hits obtained.
   */
  SliderHeadHit: number | null;

  /**
   * The amount of slider ticks hits obtained.
   */
  SliderTickHit: number | null;

  /**
   * The amount of slider repeat hits obtained.
   */
  SliderRepeatHit: number | null;

  /**
   * The amount of slider end hits obtained.
   */
  SliderEndHit: number | null;

  /**
   * The achieved accuracy.
   */
  MapAccuracy: number;

  /**
   * The PP obtained. Returns `null` if the beatmap is not ranked.
   */
  MapPP: number | null;

  /**
   * The played date of the score.
   */
  PlayedDate: string;
}
