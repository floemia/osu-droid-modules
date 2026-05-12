import { ScoreRank } from '@structures/osu';

/**
 * The raw response from the `/activity-feed` endpoint.
 *
 * Contains information about the most recent score set on the server.
 */
export interface ActivityFeedResponse {
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
   * The achieved rank.
   */
  mark: ScoreRank;

  /**
   * The achieved rank in the map's leaderboard.
   */
  mapRank: number;

  /**
   * The beatmap's URL.
   */
  beatmapUrl: string;
}
