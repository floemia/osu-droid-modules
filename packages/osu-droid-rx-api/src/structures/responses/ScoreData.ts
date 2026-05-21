import { BeatmapData } from './BeatmapData';
import { PlayerData } from './PlayerData';
export type ScoreRank = 'XH' | 'SH' | 'X' | 'S' | 'A' | 'B' | 'C' | 'D';
export type BeatmapRank = '-2' | '-1' | '0' | '1' | '2' | '3' | '4';
export interface ScoreData {
  /**
   * The obtained accuracy.
   */
  acc: number;

  /**
   * The beatmap the score was set on.
   */
  bmap: BeatmapData;

  /**
   * Whether the score is a full combo or not.
   */
  fc: boolean | null;

  /**
   * The global rank of this score.
   */
  global_placement: number;

  /**
   * The obtained rank.
   */
  grade: ScoreRank;

  /**
   * The amount of Goods (100s) obtained.
   */
  h100: number;

  /**
   * The amount of Perfects (300s) obtained.
   */
  h300: number;

  /**
   * The amount of Bads (50s) obtained.
   */
  h50: number;

  /**
   * The amount of Gekis obtained.
   */
  hgeki: number;

  /**
   * The amount of Katus obtained.
   */
  hkatsu: number;

  /**
   * The amount of Misses obtained.
   */
  hmiss: number;

  /**
   * The ID of the score.
   */
  id: number;

  /**
   * The local rank of this score.
   */
  local_placement: number;

  /**
   * The maximum combo achieved.
   */
  max_combo: number;

  /**
   * The MD5 hash of the beatmap.
   */
  md5: string;

  /**
   * The mods applied to the score.
   */
  mods: string;

  /**
   * The player that set the score.
   */
  player: PlayerData;

  /**
   * The amount of performance points obtained.
   */
  pp: number;

  /**
   * The amount of score obtained.
   */
  score: number;

  /**
   * The amount of slider end hits.
   */
  sliderendhits: number;

  /**
   * The amount of slider tick hits.
   */
  slidertickhits: number;

  /**
   * The rank status of the beatmap.
   *
   * - Graveyard: "-2" — The beatmap is in the graveyard (locally or on Bancho).
   * - NotSubmitted: "-1" — The beatmap is not found (locally or on Bancho).
   * - Pending: "0" — The beatmap is pending (Bancho).
   * - Ranked: "1" — The beatmap is ranked (Bancho).
   * - Approved: "2" — The beatmap is approved (Bancho).
   * - Qualified: "3" — The beatmap is qualified (Bancho).
   * - Loved: "4" — The beatmap is loved (Bancho).
   * - Whitelisted: "5" — The beatmap is whitelisted (locally).
   */
  status: BeatmapRank;
}
