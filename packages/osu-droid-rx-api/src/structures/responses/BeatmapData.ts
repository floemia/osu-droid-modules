/**
 * Beatmap response from the osudroid!rx API.
 */
export interface BeatmapData {
  /**
   * The approach rate of the beatmap.
   */
  ar: number;

  /**
   * The artist of the beatmap.
   */
  artist: string;

  /**
   * The BPM of the beatmap.
   */
  bpm: number;

  /**
   * The mapper of the beatmap.
   */
  creator: string;

  /**
   * The circle size of the beatmap.
   */
  cs: number;

  /**
   * The HP drain rate of the beatmap.
   */
  hp: number;

  /**
   * The ID of the beatmap.
   */
  id: number;

  /**
   * The last update date of the beatmap.
   */
  last_update: string;

  /**
   * The maximum combo of the beatmap.
   */
  max_combo: number;

  /**
   * The MD5 hash of the beatmap.
   */
  md5: string;

  /**
   * The mode of the beatmap.
   */
  mode: number;

  /**
   * The overall difficulty of the beatmap.
   */
  od: number;

  /**
   * The ID of the beatmapset.
   */
  set_id: number;

  /**
   * The star rating of the beatmap.
   */
  star: number;

  /**
   * The rank status of the beatmap.
   *
   * - Graveyard: -2 — The beatmap is in the graveyard (locally or on Bancho).
   * - NotSubmitted: -1 — The beatmap is not found (locally or on Bancho).
   * - Pending: 0 — The beatmap is pending (Bancho).
   * - Ranked: 1 — The beatmap is ranked (Bancho).
   * - Approved: 2 — The beatmap is approved (Bancho).
   * - Qualified: 3 — The beatmap is qualified (Bancho).
   * - Loved: 4 — The beatmap is loved (Bancho).
   * - Whitelisted: 5 — The beatmap is whitelisted (locally).
   */
  status: number;

  /**
   * The title of the beatmap.
   */
  title: string;

  /**
   * The version of the beatmap.
   */
  version: string;

  /**
   * The total length of the beatmap.
   */
  total_length: number;
}
