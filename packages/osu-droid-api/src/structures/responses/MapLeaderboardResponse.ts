import { LeaderboardType } from '@structures/parameters';
import { Mod } from './ScoreResponse';

/**
 * The raw response from the `/game/leaderboard` endpoint.
 */
export interface MapLeaderboardResponse {
  /**
   * MD5 hash of the beatmap.
   */
  MapHash: string;

  /**
   * Type of leaderboard.
   */
  Type: LeaderboardType;

  /**
   * The top 50 in the specified leaderboard.
   */
  Top50Plays: MapLeaderboardScore[];

  /**
   * The personal best if `uid` is specified. Will be `null` if the score is in the top 50.
   */
  PersonalBest: MapLeaderboardScore | null;
}

/**
 * A score from the leaderboard of a beatmap.
 */
export interface MapLeaderboardScore {
  /**
   * The score's ID.
   */
  ScoreId: number;

  /**
   * The username of the player.
   */
  Username: string;

  /**
   * The mods applied to this score.
   */
  Mods: Mod[];

  /**
   * The achieved total score.
   */
  MapTotalScore: number;

  /**
   * The maximum combo achieved.
   */
  MapCombo: number;

  /**
   * The achieved rank.
   */
  MapRank: string;

  /**
   * The achieved accuracy.
   */
  MapAccuracy: number;

  /**
   * The achieved PP. `null` if not ranked.
   */
  MapPP: number | null;

  /**
   * The achieved rank in the leaderboard.
   */
  LeaderboardRank: number;

  /**
   * The avatar URL of the player.
   */
  AvatarUrl: string;
}
