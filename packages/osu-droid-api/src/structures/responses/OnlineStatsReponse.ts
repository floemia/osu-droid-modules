/**
 * The raw response from the `/online-stats` endpoint.
 *
 * Contains information about the server's online stats.
 */
export interface OnlineStatsResponse {
  /**
   * The amount of registered users on the server.
   */
  RegisteredUsers: number;

  /**
   * The amount of active users on the server in the last hour.
   */
  ActiveUsersLastHour: number;

  /**
   * The amount of active users on the server in the last week.
   */
  ActiveUsersLastWeek: number;
}
