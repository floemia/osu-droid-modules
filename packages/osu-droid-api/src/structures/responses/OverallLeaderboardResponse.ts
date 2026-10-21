export interface OverallLeaderboardUser {
  /**
   * The user's ID.
   */
  UserId: number;

  /**
   * The user's username.
   */
  Username: string;

  /**
   * The user's overall playcount.
   */
  OverallPlaycount: number;

  /**
   * The user's country. [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) compliant.
   */
  Region: string;
}

/**
 * A user in the `/leaderboard` endpoint if `type == 'score'`.
 */
export interface OverallScoreLeaderboardUser extends OverallLeaderboardUser {
  /**
   * The user's overall score.
   */
  OverallScore: number;
}

/**
 * A user in the `/leaderboard` endpoint if `type == 'pp'`.
 */
export interface OverallPPLeaderboardUser extends OverallLeaderboardUser {
  /**
   * The user's overall PP.
   */
  OverallPP: number;
}

/**
 * The raw response from the `/leaderboard` endpoint.
 *
 * Contains users, sorted by their overall score or performance points.
 */
export interface LeaderboardResponse<T extends OverallPPLeaderboardUser | OverallScoreLeaderboardUser> {
  /**
   * The users in the score / pp leaderboard.
   */
  Results: T extends OverallScoreLeaderboardUser ? OverallScoreLeaderboardUser[] : OverallPPLeaderboardUser[];

  /**
   * The total number of pages.
   */
  TotalPages: number;

  /**
   * The previous page. `null` if `CurrentPage == 1`.
   */
  PrevPage: number | null;

  /**
   * The current page.
   */
  CurrentPage: number;

  /**
   * The next page. `null` if `CurrentPage == TotalPages`.
   */
  NextPage: number | null;
}
