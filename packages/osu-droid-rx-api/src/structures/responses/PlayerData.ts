/**
 * Player stats response from the osudroid!rx API.
 */
export interface PlayerStats {
  /**
   * The ID of the user.
   */
  id: number;

  /**
   * The overall accuracy of the user.
   */
  acc: number;

  /**
   * The country PP rank of the player.
   */
  country_pp_rank: number;

  /**
   * The country score rank of the player.
   */
  country_score_rank: number;

  /**
   * The MD5 hash of the beatmap the player is currently playing.
   */
  playing: string | null;

  /**
   * The total playcount of the player.
   */
  plays: number;

  /**
   * The total performance points of the player.
   */
  pp: number;

  /**
   * The global performance points rank of the player.
   */
  pp_rank: number;

  /**
   * The ranked score of the player.
   */
  rscore: number;

  /**
   * The global score rank of the player.
   */
  score_rank: number;

  /**
   * The total score of the player.
   */
  tscore: number;
}

/**
 * Player response from the osudroid!rx API.
 */
export interface PlayerData {
  /**
   * The country of the player ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) compliant).
   */
  country: string | null;

  /**
   * The ID of the player.
   */
  id: number;

  /**
   * The online status of the player.
   */
  online: boolean;

  /**
   * The prefix of the player's name.
   */
  prefix: string | null;

  /**
   * The user's statistics.
   */
  stats: PlayerStats;

  /**
   * The username of the player.
   */
  username: string;
}
