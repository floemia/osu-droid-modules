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
