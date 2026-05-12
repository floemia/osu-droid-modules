/**
 * The raw response from the `/special-users` endpoint.
 *
 * Contains information about developers, contributors and supporters.
 */
export interface SpecialUsersResponse {
  /**
   * The user's ID.
   */
  UserId: number;

  /**
   * The user's username.
   */
  Username: string;

  /**
   * Whether the user is a core developer or not.
   */
  CoreDeveloper: boolean;

  /**
   * Whether the user is a developer or not.
   */
  Developer: boolean;

  /**
   * Whether the user is a contributor or not.
   */
  Contributor: boolean;

  /**
   * Whether the user is a supporter or not.
   */
  Supporter: boolean;
}
